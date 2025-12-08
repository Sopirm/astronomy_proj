const axios = require('axios');

class AstroController {
  async events(req, res) {
    try {
      // Параметры с дефолтами как в Laravel
      const lat = parseFloat(req.query.lat) || 55.7558;
      const lon = parseFloat(req.query.lon) || 37.6176;  
      const days = Math.max(1, Math.min(30, parseInt(req.query.days) || 7));

      // Даты как в Laravel
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Авторизация
      const appId = process.env.ASTRO_APP_ID || '';
      const secret = process.env.ASTRO_APP_SECRET || '';
      
      if (!appId || !secret) {
        return res.status(500).json({ 
          error: 'Missing ASTRO_APP_ID/ASTRO_APP_SECRET' 
        });
      }

      const auth = Buffer.from(`${appId}:${secret}`).toString('base64');
      const url = 'https://api.astronomyapi.com/api/v2/bodies/events?' + 
                  new URLSearchParams({
                    latitude: lat.toString(),
                    longitude: lon.toString(),
                    from,
                    to
                  }).toString();

      // HTTP запрос как в Laravel
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'monolith-iss/1.0'
        },
        timeout: 25000,
        validateStatus: function (status) {
          return status < 500; // Принимаем статусы < 500
        }
      });

      if (response.status >= 400) {
        return res.status(403).json({
          error: `HTTP ${response.status}`,
          code: response.status,
          raw: response.data
        });
      }

      const jsonData = response.data;
      res.json(jsonData || { raw: response.data });

    } catch (error) {
      console.error('Astro API error:', error.message);
      
      const statusCode = error.response?.status || 500;
      res.status(403).json({
        error: error.message || 'Request failed',
        code: statusCode,
        raw: error.response?.data || null
      });
    }
  }
}

module.exports = AstroController;
