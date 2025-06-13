const ApiResponse = require('../utils/api.response');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  ApiResponse.notFound(res, `Resource not found - ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Something went wrong';
  let errors = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => val.message);
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = { field: Object.keys(err.keyValue)[0], value: Object.values(err.keyValue)[0] };
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    errors
  });

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = { notFound, errorHandler };