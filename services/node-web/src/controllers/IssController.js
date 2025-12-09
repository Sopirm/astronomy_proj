const axios = require('axios');

class IssController {
  constructor() {
    this.rustBase = process.env.RUST_API_URL || 'http://rust_iss:3000';
  }

  async index(req, res) {
    try {
      // Получаем данные как в Laravel
      const [lastResponse, trendResponse] = await Promise.allSettled([
        this.fetchJson(`${this.rustBase}/last`),
        this.fetchJson(`${this.rustBase}/iss/trend`)
      ]);

      const lastData = lastResponse.status === 'fulfilled' ? lastResponse.value : {};
      const trendData = trendResponse.status === 'fulfilled' ? trendResponse.value : {};

      res.render('iss', {
        title: 'МКС - Трекинг и Мониторинг | Кассиопея',
        currentPath: req.path,
        last: lastData,
        trend: trendData,
        base: this.rustBase
      });

    } catch (error) {
      console.error('ISS page error:', error);
      res.render('iss', {
        title: 'МКС - Трекинг и Мониторинг | Кассиопея', 
        currentPath: req.path,
        last: {},
        trend: {},
        base: this.rustBase
      });
    }
  }

  async last(req, res) {
    try {
      const data = await this.fetchJson(`${this.rustBase}/last`);
      res.json(data);
    } catch (error) {
      console.error('Error in IssController.last:', error);
      res.status(500).json({ error: 'Failed to fetch last ISS data' });
    }
  }

  async trend(req, res) {
    try {
      const data = await this.fetchJson(`${this.rustBase}/iss/trend`);
      res.json(data);
    } catch (error) {
      console.error('Error in IssController.trend:', error);
      res.status(500).json({ error: 'Failed to fetch ISS trend data' });
    }
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

module.exports = IssController;
