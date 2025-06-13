class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data
      });
    }
  
    static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
      return res.status(statusCode).json({
        success: false,
        message,
        errors
      });
    }
  
    static created(res, data = null, message = 'Resource created successfully') {
      return this.success(res, data, message, 201);
    }
  
    static badRequest(res, message = 'Bad request', errors = null) {
      return this.error(res, message, 400, errors);
    }
  
    static unauthorized(res, message = 'Unauthorized', errors = null) {
      return this.error(res, message, 401, errors);
    }
  
    static forbidden(res, message = 'Forbidden', errors = null) {
      return this.error(res, message, 403, errors);
    }
  
    static notFound(res, message = 'Resource not found', errors = null) {
      return this.error(res, message, 404, errors);
    }
  }
  
  module.exports = ApiResponse;