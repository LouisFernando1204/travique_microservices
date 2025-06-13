const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const Payment = require('../../models/payment.model');
const paymentService = require('../../services/payment.service');
const config = require('../../config');

jest.mock('../../services/payment.service');

describe('Payment API Routes', () => {
  let token;
  let userId;
  let mockPayment;
  
  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
    
    token = jwt.sign({ id: userId, role: 'user' }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
    
    mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      bookingId: new mongoose.Types.ObjectId(),
      userId,
      amount: 50000,
      midtransOrderId: 'order-123',
      status: 'pending',
      snapToken: 'snap-token-123',
      paymentUrl: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    paymentService.createPayment.mockResolvedValue({
      paymentId: mockPayment._id,
      midtransOrderId: mockPayment.midtransOrderId,
      snapToken: mockPayment.snapToken,
      paymentUrl: mockPayment.paymentUrl,
      status: mockPayment.status
    });
    
    paymentService.processBankTransfer.mockResolvedValue({
      paymentId: mockPayment._id,
      midtransOrderId: mockPayment.midtransOrderId,
      vaNumber: '12345678901',
      bank: 'bca',
      status: mockPayment.status
    });
    
    paymentService.getPaymentStatus.mockResolvedValue(mockPayment);
    
    paymentService.cancelPayment.mockResolvedValue({
      ...mockPayment,
      status: 'canceled'
    });
    
    paymentService.getUserPayments.mockResolvedValue({
      payments: [mockPayment],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1
      }
    });
    
    paymentService.getPaymentsByBooking.mockResolvedValue([mockPayment]);
    
    paymentService.processNotification.mockResolvedValue({
      paymentId: mockPayment._id,
      status: 'success',
      bookingId: mockPayment.bookingId
    });
  });
  
  describe('POST /api/payments', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        bookingId: mockPayment.bookingId.toString(),
        amount: mockPayment.amount
      };
      
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        paymentId: mockPayment._id.toString(),
        snapToken: mockPayment.snapToken,
        paymentUrl: mockPayment.paymentUrl
      }));
      
      expect(paymentService.createPayment).toHaveBeenCalledWith({
        bookingId: paymentData.bookingId,
        userId: userId.toString(),
        amount: paymentData.amount
      });
    });
    
    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50000 }); 
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          bookingId: mockPayment.bookingId.toString(),
          amount: mockPayment.amount
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/payments/bank-transfer', () => {
    it('should process bank transfer successfully', async () => {
      const paymentData = {
        bookingId: mockPayment.bookingId.toString(),
        amount: mockPayment.amount,
        bank: 'bca'
      };
      
      const response = await request(app)
        .post('/api/payments/bank-transfer')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        paymentId: mockPayment._id.toString(),
        vaNumber: '12345678901',
        bank: 'bca'
      }));
      
      expect(paymentService.processBankTransfer).toHaveBeenCalledWith({
        bookingId: paymentData.bookingId,
        userId: userId.toString(),
        amount: paymentData.amount,
        bank: paymentData.bank
      });
    });
    
    it('should return 400 if invalid bank', async () => {
      const response = await request(app)
        .post('/api/payments/bank-transfer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookingId: mockPayment.bookingId.toString(),
          amount: mockPayment.amount,
          bank: 'invalid-bank' 
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/payments/notifications', () => {
    it('should handle Midtrans notification', async () => {
      const notification = {
        transaction_id: 'transaction-123',
        order_id: mockPayment.midtransOrderId,
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'bank_transfer'
      };
      
      const response = await request(app)
        .post('/api/payments/notifications')
        .send(notification);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(paymentService.processNotification).toHaveBeenCalledWith(notification);
    });
    
    it('should return 200 even if processing fails', async () => {
      paymentService.processNotification.mockRejectedValueOnce(new Error('Test error'));
      
      const notification = {
        transaction_id: 'transaction-123',
        order_id: 'invalid-order',
        transaction_status: 'settlement'
      };
      
      const response = await request(app)
        .post('/api/payments/notifications')
        .send(notification);
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('GET /api/payments/:id', () => {
    it('should get payment status', async () => {
      const paymentId = mockPayment._id.toString();
      
      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        _id: paymentId,
        status: mockPayment.status
      }));
      
      expect(paymentService.getPaymentStatus).toHaveBeenCalledWith(paymentId);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get(`/api/payments/${mockPayment._id}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/payments/:id/cancel', () => {
    it('should cancel payment successfully', async () => {
      const paymentId = mockPayment._id.toString();
      
      const response = await request(app)
        .post(`/api/payments/${paymentId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        _id: paymentId,
        status: 'canceled'
      }));
      
      expect(paymentService.cancelPayment).toHaveBeenCalledWith(paymentId);
    });
  });
  
  describe('GET /api/payments/user/me', () => {
    it('should get user payments with pagination', async () => {
      const response = await request(app)
        .get('/api/payments/user/me?page=1&limit=10&status=pending')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        payments: [expect.objectContaining({
          _id: mockPayment._id.toString()
        })],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
      
      expect(paymentService.getUserPayments).toHaveBeenCalledWith(
        userId.toString(),
        { page: '1', limit: '10', status: 'pending' }
      );
    });
  });
  
  describe('GET /api/payments/booking/:bookingId', () => {
    it('should get payments by booking ID', async () => {
      const bookingId = mockPayment.bookingId.toString();
      
      const response = await request(app)
        .get(`/api/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          _id: mockPayment._id.toString(),
          bookingId: bookingId
        })
      ]);
      
      expect(paymentService.getPaymentsByBooking).toHaveBeenCalledWith(bookingId);
    });
  });
});