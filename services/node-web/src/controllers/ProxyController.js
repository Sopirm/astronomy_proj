const axios = require('axios');

class ProxyController {
  constructor() {
    this.rustBase = process.env.RUST_API_URL || 'http://rust_iss:3000';
  }

  async last(req, res) {
    return this.pipe('/last', req, res);
  }

  async trend(req, res) {
    const queryString = new URLSearchParams(req.query).toString();
    const path = `/iss/trend${queryString ? '?' + queryString : ''}`;
    return this.pipe(path, req, res);
  }

  async pipe(path, req, res) {
    const url = this.rustBase + path;
    
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: function (status) {
          return true; // Принимаем любые статусы для совместимости
        }
      });

      let body = response.data;
      
      // Валидация JSON как в Laravel
      if (typeof body !== 'object' || body === null) {
        body = {};
      }

      res.set('Content-Type', 'application/json');
      res.status(200).json(body);
      
    } catch (error) {
      console.error(`Proxy error for ${url}:`, error.message);
      
      // Fallback как в Laravel
      res.set('Content-Type', 'application/json');
      res.status(200).json({ error: 'upstream' });
    }
  }
}

module.exports = ProxyController;
