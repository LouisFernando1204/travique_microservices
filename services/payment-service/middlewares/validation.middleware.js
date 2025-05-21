const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api.response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.badRequest(res, 'Validation Error', errors.array());
  }
  next();
};

module.exports = { validate };