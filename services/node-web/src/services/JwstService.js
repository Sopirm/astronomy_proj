const axios = require('axios');

class JwstService {
  constructor() {
    this.host = (process.env.JWST_HOST || 'https://api.jwstapi.com').replace(/\/$/, '');
    this.key = process.env.JWST_API_KEY || '';
    this.email = process.env.JWST_EMAIL || null;
  }

  async get(path, qs = {}) {
    try {
      let url = `${this.host}/${path.replace(/^\//, '')}`;
      
      if (Object.keys(qs).length > 0) {
        const separator = url.includes('?') ? '&' : '?';
        url += separator + new URLSearchParams(qs).toString();
      }

      const headers = {
        'x-api-key': this.key
      };

      if (this.email) {
        headers['email'] = this.email;
      }

      const response = await axios.get(url, {
        headers,
        timeout: 30000
      });

      return Array.isArray(response.data) ? response.data : (response.data || {});
    } catch (error) {
      console.error(`JWST API error for ${path}:`, error.message);
      return {};
    }
  }

  /**
   * Ищем первую пригодную картинку в произвольной структуре
   * Аналог Laravel JwstHelper::pickImageUrl
   */
  static pickImageUrl(obj) {
    const stack = [obj];
    
    while (stack.length > 0) {
      const current = stack.pop();
      
      if (!current || typeof current !== 'object') continue;
      
      for (const [key, value] of Object.entries(current)) {
        if (typeof value === 'string' && /^https?:\/\/.*\.(jpg|jpeg|png)$/i.test(value)) {
          return value;
        }
        
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          stack.push(value);
        }
      }
    }
    
    return null;
  }
}

module.exports = JwstService;
