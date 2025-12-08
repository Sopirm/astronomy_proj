const axios = require('axios');
const JwstService = require('../services/JwstService');

class DashboardController {
  constructor() {
    this.rustBase = process.env.RUST_API_URL || 'http://rust_iss:3000';
    this.jwstService = new JwstService();
  }

  async index(req, res) {
    try {
      // Получаем данные МКС (аналогично Laravel)
      const issData = await this.getJson(`${this.rustBase}/last`);
      
      // Подготавливаем данные как в Laravel
      const viewData = {
        title: 'Космический Дашборд | Кассиопея',
        currentPath: req.path,
        message: 'Node.js система успешно запущена!',
        iss: issData,
        trend: [], // фронт сам заберёт через /api/iss/trend
        jw_gallery: [], // не нужно сервером
        jw_observation_raw: [],
        jw_observation_summary: [],
        jw_observation_images: [],
        jw_observation_files: [],
        metrics: {
          iss_speed: issData?.payload?.velocity || null,
          iss_alt: issData?.payload?.altitude || null,
          neo_total: 0
        }
      };

      res.render('dashboard', viewData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.render('dashboard', {
        title: 'Космический Дашборд | Кассиопея',
        currentPath: req.path,
        message: null, // Нет сообщения при ошибке
        iss: {},
        trend: [],
        jw_gallery: [],
        jw_observation_raw: [],
        jw_observation_summary: [],
        jw_observation_images: [],
        jw_observation_files: [],
        metrics: {
          iss_speed: null,
          iss_alt: null,
          neo_total: 0
        }
      });
    }
  }

  /**
   * /api/jwst/feed — серверный прокси/нормализатор JWST картинок
   * ПОЛНАЯ совместимость с Laravel API
   */
  async jwstFeed(req, res) {
    try {
      const {
        source = 'jpg',
        suffix = '',
        program = '',
        instrument = '',
        page = 1,
        perPage = 24
      } = req.query;

      // Валидация как в Laravel
      const validPage = Math.max(1, parseInt(page));
      const validPerPage = Math.max(1, Math.min(60, parseInt(perPage)));
      const instF = instrument.toUpperCase().trim();

      // Определяем path как в Laravel
      let path = 'all/type/jpg';
      if (source === 'suffix' && suffix.trim()) {
        path = `all/suffix/${suffix.trim().replace(/^\//, '')}`;
      }
      if (source === 'program' && program.trim()) {
        path = `program/id/${encodeURIComponent(program.trim())}`;
      }

      // Получаем данные через JwstService
      const resp = await this.jwstService.get(path, {
        page: validPage,
        perPage: validPerPage
      });

      const list = resp.body || resp.data || (Array.isArray(resp) ? resp : []);
      const items = [];

      for (const it of list) {
        if (!it || typeof it !== 'object') continue;

        // Выбираем валидную картинку (логика как в Laravel)
        let url = null;
        const loc = it.location || it.url || null;
        const thumb = it.thumbnail || null;
        
        for (const u of [loc, thumb]) {
          if (typeof u === 'string' && /\.(jpg|jpeg|png)(\?.*)?$/i.test(u)) {
            url = u;
            break;
          }
        }

        if (!url) {
          url = JwstService.pickImageUrl(it);
        }
        if (!url) continue;

        // Фильтр по инструменту
        const instList = [];
        const instruments = it.details?.instruments || [];
        for (const I of instruments) {
          if (I && typeof I === 'object' && I.instrument) {
            instList.push(I.instrument.toUpperCase());
          }
        }

        if (instF && instList.length && !instList.includes(instF)) continue;

        // Формируем item как в Laravel
        items.push({
          url: url,
          obs: String(it.observation_id || it.observationId || ''),
          program: String(it.program || ''),
          suffix: String(it.details?.suffix || it.suffix || ''),
          inst: instList,
          caption: [
            it.observation_id || it.id || '',
            'P' + (it.program || '-'),
            it.details?.suffix ? it.details.suffix : '',
            instList.length ? instList.join('/') : ''
          ].filter(Boolean).join(' · '),
          link: loc || url
        });

        if (items.length >= validPerPage) break;
      }

      // Ответ в формате Laravel
      res.json({
        source: path,
        count: items.length,
        items: items
      });

    } catch (error) {
      console.error('JWST Feed error:', error);
      res.json({
        source: 'error',
        count: 0,
        items: []
      });
    }
  }

  // Утилитная функция (аналог Laravel getJson)
  async getJson(url, qs = {}) {
    try {
      if (Object.keys(qs).length > 0) {
        const separator = url.includes('?') ? '&' : '?';
        url += separator + new URLSearchParams(qs).toString();
      }

      const response = await axios.get(url, { timeout: 5000 });
      return response.data || {};
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return {};
    }
  }
}

module.exports = DashboardController;
