// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const HttpClient = require('../utils/http.client');
const ApiResponse = require('../utils/api.response');
const logger = require('../utils/logger');

const authClient = new HttpClient(config.services.auth.baseUrl, config.services.auth.timeout);

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = { id: decoded.id, role: decoded.role };
    } catch (error) {

      try {
        const response = await authClient.post('/api/auth/verify-token', { token });
        if (response.success) {
          req.user = response.data.user;
        } else {
          return ApiResponse.unauthorized(res, 'Invalid token');
        }
      } catch (authError) {
        logger.error('Error verifying token with auth service', authError);
        return ApiResponse.unauthorized(res, 'Invalid token');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Access denied. Not authenticated');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Access denied. Not authorized');
    }

    next();
  };
};

module.exports = { authenticate, authorize };