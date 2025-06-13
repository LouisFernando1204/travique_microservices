// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const HttpClient = require('../utils/http.client');
const ApiResponse = require('../utils/api.response');
const logger = require('../utils/logger');

const authClient = new HttpClient(config.services.auth.baseUrl, config.services.auth.timeout);

const authenticate = async (req, res, next) => {
  try {
    // Extract token dari Authorization header
    const token = req.header('Authorization');
    
    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided');
    }

    // Remove Bearer prefix jika ada
    const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;

    // Decode JWT untuk mendapatkan user ID (tanpa verifikasi signature)
    let decoded;
    try {
      decoded = jwt.decode(cleanToken);
      if (!decoded || !decoded.id) {
        return ApiResponse.unauthorized(res, 'Invalid token format');
      }
    } catch (decodeError) {
      logger.error('Error decoding token:', decodeError);
      return ApiResponse.unauthorized(res, 'Invalid token format');
    }

    const userId = decoded.id;

    // Verify token dengan auth service sesuai dokumentasi
    try {
      // GET /api/auth/verify_token/{userId} dengan Authorization header
      const response = await authClient.get(`/api/auth/verify_token/${userId}`, {
        headers: {
          'Authorization': cleanToken
        }
      });

      // Check response sesuai format dokumentasi
      if (response.data && response.data.status === 'success') {
        // Set user data dari response auth service
        req.user = {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          role: response.data.data.user.role || 'user' // default role jika tidak ada
        };
        next();
      } else {
        return ApiResponse.unauthorized(res, 'Invalid token');
      }

    } catch (authError) {
      logger.error('Error verifying token with auth service:', authError.response?.data || authError.message);
      
      // Handle different error responses
      if (authError.response?.status === 403) {
        return ApiResponse.forbidden(res, 'Invalid user token');
      } else if (authError.response?.status === 401) {
        return ApiResponse.unauthorized(res, 'Unauthorized or verification failed');
      } else {
        return ApiResponse.unauthorized(res, 'Token verification failed');
      }
    }

  } catch (error) {
    logger.error('Authentication error:', error);
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