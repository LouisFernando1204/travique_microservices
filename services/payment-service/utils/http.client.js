const axios = require('axios');
const logger = require('./logger');

class HttpClient {
  constructor(baseURL, timeout = 5000, headers = {}) {
    this.instance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    this.instance.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
          baseURL: config.baseURL,
          headers: config.headers,
          params: config.params,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response.data;
      },
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            data: error.response.data
          });
        } else if (error.request) {
          logger.error('API Error: No response received', {
            request: error.request
          });
        } else {
          logger.error('API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, params = {}, headers = {}) {
    return this.instance.get(url, { params, headers });
  }

  async post(url, data = {}, headers = {}) {
    return this.instance.post(url, data, { headers });
  }

  async put(url, data = {}, headers = {}) {
    return this.instance.put(url, data, { headers });
  }

  async patch(url, data = {}, headers = {}) {
    return this.instance.patch(url, data, { headers });
  }

  async delete(url, headers = {}) {
    return this.instance.delete(url, { headers });
  }
}

module.exports = HttpClient;