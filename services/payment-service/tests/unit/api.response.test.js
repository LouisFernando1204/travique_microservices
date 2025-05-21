const ApiResponse = require('../../utils/api.response');

describe('API Response Utility', () => {
  let mockRes;
  
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  describe('success', () => {
    it('should return success response with default values', () => {
      ApiResponse.success(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: null
      });
    });
    
    it('should return success response with custom values', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';
      const statusCode = 201;
      
      ApiResponse.success(mockRes, data, message, statusCode);
      
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data
      });
    });
  });
  
  describe('error', () => {
    it('should return error response with default values', () => {
      ApiResponse.error(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred',
        errors: null
      });
    });
    
    it('should return error response with custom values', () => {
      const message = 'Custom error message';
      const statusCode = 400;
      const errors = ['Field is required'];
      
      ApiResponse.error(mockRes, message, statusCode, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        errors
      });
    });
  });
  
  describe('created', () => {
    it('should return created response with status 201', () => {
      const data = { id: 1 };
      
      ApiResponse.created(mockRes, data);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Resource created successfully',
        data
      });
    });
  });
  
  describe('badRequest', () => {
    it('should return bad request response with status 400', () => {
      const errors = { field: 'Invalid value' };
      
      ApiResponse.badRequest(mockRes, 'Validation failed', errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors
      });
    });
  });
  
  describe('unauthorized', () => {
    it('should return unauthorized response with status 401', () => {
      ApiResponse.unauthorized(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        errors: null
      });
    });
  });
  
  describe('forbidden', () => {
    it('should return forbidden response with status 403', () => {
      ApiResponse.forbidden(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden',
        errors: null
      });
    });
  });
  
  describe('notFound', () => {
    it('should return not found response with status 404', () => {
      ApiResponse.notFound(mockRes, 'Resource not found');
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
        errors: null
      });
    });
  });
});