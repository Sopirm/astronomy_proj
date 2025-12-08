const axios = require('axios');

class OsdrController {
  constructor() {
    this.rustBase = process.env.RUST_API_URL || 'http://rust_iss:3000';
  }

  async index(req, res) {
    try {
      // Параметры как в Laravel (учебная нестрогая валидация)
      const limit = req.query.limit || '20';
      const url = `${this.rustBase}/osdr/list?limit=${limit}`;

      const response = await this.fetchJson(url);
      const data = response || { items: [] };
      let items = data.items || [];

      // Ключевая строка - flattenOsdr как в Laravel
      items = this.flattenOsdr(items);

      res.render('osdr', {
        title: 'OSDR - Космические Эксперименты | Кассиопея',
        currentPath: req.path,
        items: items,
        src: url
      });

    } catch (error) {
      console.error('OSDR page error:', error);
      res.render('osdr', {
        title: 'OSDR - Космические Эксперименты | Кассиопея',
        currentPath: req.path, 
        items: [],
        src: `${this.rustBase}/osdr/list?limit=20`
      });
    }
  }

  /**
   * Преобразует данные вида {"OSD-1": {...}, "OSD-2": {...}} в плоский список
   * ТОЧНАЯ копия логики из Laravel OsdrController
   */
  flattenOsdr(items) {
    const out = [];
    
    for (const row of items) {
      const raw = row.raw || {};
      
      if (Array.isArray(raw) && this.looksOsdrDict(raw)) {
        for (const [k, v] of Object.entries(raw)) {
          if (!v || typeof v !== 'object') continue;
          
          const rest = v.REST_URL || v.rest_url || v.rest || null;
          let title = v.title || v.name || null;
          
          if (!title && typeof rest === 'string') {
            // запасной вариант: последний сегмент URL как подпись
            title = rest.replace(/\/$/, '').split('/').pop();
          }
          
          out.push({
            id: row.id,
            dataset_id: k,
            title: title,
            status: row.status || null,
            updated_at: row.updated_at || null,
            inserted_at: row.inserted_at || null,
            rest_url: rest,
            raw: v
          });
        }
      } else {
        // обычная строка — просто прокинем REST_URL если найдётся
        row.rest_url = (Array.isArray(raw) && raw.REST_URL) ? 
                       (raw.REST_URL || raw.rest_url || null) : null;
        out.push(row);
      }
    }
    
    return out;
  }

  /**
   * Проверяет, является ли объект словарем OSDR
   * ТОЧНАЯ копия логики из Laravel
   */
  looksOsdrDict(raw) {
    if (!Array.isArray(raw)) return false;
    
    // словарь ключей "OSD-xxx" ИЛИ значения содержат REST_URL
    for (const [k, v] of Object.entries(raw)) {
      if (typeof k === 'string' && k.startsWith('OSD-')) return true;
      if (v && typeof v === 'object' && (v.REST_URL || v.rest_url)) return true;
    }
    
    return false;
  }

  async fetchJson(url) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data || {};
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return {};
    }
  }
}

module.exports = OsdrController;
