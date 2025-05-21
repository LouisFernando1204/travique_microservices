const mongoose = require('mongoose');
const Payment = require('../../models/payment.model');
const paymentService = require('../../services/payment.service');
const midtransService = require('../../services/midtrans.service');
const HttpClient = require('../../utils/http.client');

jest.mock('../../models/payment.model');
jest.mock('../../services/midtrans.service');
jest.mock('../../utils/http.client');

describe('Payment Service', () => {
  let mockPayment;
  let mockBooking;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      bookingId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      amount: 50000,
      midtransOrderId: 'order-123',
      status: 'pending',
      snapToken: 'snap-token-123',
      paymentUrl: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123',
      save: jest.fn().mockResolvedValue(true)
    };
    
    mockBooking = {
      _id: mockPayment.bookingId,
      userId: mockPayment.userId,
      touristSpotId: new mongoose.Types.ObjectId(),
      totalPrice: 50000,
      status: 'Pending',
      paymentId: null
    };
    
    Payment.findById.mockResolvedValue(mockPayment);
    Payment.findOne.mockResolvedValue(mockPayment);
    Payment.find.mockResolvedValue([mockPayment]);
    Payment.countDocuments.mockResolvedValue(1);
    Payment.mockImplementation(() => mockPayment);
    
    midtransService.generateOrderId.mockReturnValue('order-123');
    midtransService.generateSnapToken.mockResolvedValue({
      token: 'snap-token-123',
      redirectUrl: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123'
    });
    midtransService.createTransaction.mockResolvedValue({
      transaction_id: 'transaction-123',
      order_id: 'order-123',
      va_numbers: [{ bank: 'bca', va_number: '12345678901' }]
    });
    midtransService.getTransactionStatus.mockResolvedValue({
      transaction_status: 'settlement',
      fraud_status: 'accept',
      transaction_id: 'transaction-123'
    });
    midtransService.handleNotification.mockResolvedValue({
      transactionStatus: 'settlement',
      fraudStatus: 'accept',
      orderId: 'order-123',
      statusCode: '200',
      paymentType: 'bank_transfer',
      rawResponse: {}
    });
    
    const mockHttpClient = {
      get: jest.fn().mockResolvedValue({ data: mockBooking }),
      patch: jest.fn().mockResolvedValue({ data: { success: true } })
    };
    HttpClient.mockImplementation(() => mockHttpClient);
  });
  
  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        bookingId: mockBooking._id.toString(),
        userId: mockBooking.userId.toString(),
        amount: mockBooking.totalPrice
      };
      
      const result = await paymentService.createPayment(paymentData);
      
      expect(result).toEqual(expect.objectContaining({
        paymentId: mockPayment._id,
        midtransOrderId: 'order-123',
        snapToken: 'snap-token-123',
        paymentUrl: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123'
      }));
      
      const mockHttpClient = HttpClient.mock.results[0].value;
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/bookings/${paymentData.bookingId}`);
      
      expect(midtransService.generateSnapToken).toHaveBeenCalled();
      
      expect(mockPayment.save).toHaveBeenCalled();
      
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `/api/bookings/${paymentData.bookingId}/payment`,
        { paymentId: mockPayment._id }
      );
    });
    
    it('should throw error if booking not found', async () => {
      const mockHttpClient = HttpClient.mock.results[0].value;
      mockHttpClient.get.mockResolvedValueOnce({ data: null });
      
      const paymentData = {
        bookingId: 'non-existent-id',
        userId: mockBooking.userId.toString(),
        amount: 50000
      };
      
      await expect(paymentService.createPayment(paymentData)).rejects.toThrow(/Booking not found/);
    });
    
    it('should throw error if booking is cancelled', async () => {
      const cancelledBooking = { ...mockBooking, status: 'Cancelled' };
      const mockHttpClient = HttpClient.mock.results[0].value;
      mockHttpClient.get.mockResolvedValueOnce({ data: cancelledBooking });
      
      const paymentData = {
        bookingId: mockBooking._id.toString(),
        userId: mockBooking.userId.toString(),
        amount: 50000
      };
      
      await expect(paymentService.createPayment(paymentData)).rejects.toThrow(/cancelled booking/);
    });
    
    it('should throw error if amount does not match booking price', async () => {
      const paymentData = {
        bookingId: mockBooking._id.toString(),
        userId: mockBooking.userId.toString(),
        amount: 40000 
      };
      
      await expect(paymentService.createPayment(paymentData)).rejects.toThrow(/amount .* does not match/);
    });
  });
  
  describe('processBankTransfer', () => {
    it('should process bank transfer successfully', async () => {
      const paymentData = {
        bookingId: mockBooking._id.toString(),
        userId: mockBooking.userId.toString(),
        amount: mockBooking.totalPrice,
        bank: 'bca'
      };
      
      const result = await paymentService.processBankTransfer(paymentData);
      
      expect(result).toEqual(expect.objectContaining({
        paymentId: mockPayment._id,
        midtransOrderId: 'order-123',
        bank: 'bca'
      }));
      
      expect(midtransService.createTransaction).toHaveBeenCalled();
      
      expect(mockPayment.save).toHaveBeenCalled();
    });
  });
  
  describe('processNotification', () => {
    it('should process settlement notification and update payment to success', async () => {
      const notification = {
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'bank_transfer',
        transaction_time: '2023-01-01 12:00:00'
      };
      
      const result = await paymentService.processNotification(notification);
      
      expect(result).toEqual(expect.objectContaining({
        paymentId: mockPayment._id,
        status: 'success',
        bookingId: mockPayment.bookingId
      }));
      
      expect(mockPayment.status).toBe('success');
      expect(mockPayment.save).toHaveBeenCalled();
      
      const mockHttpClient = HttpClient.mock.results[0].value;
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `/api/bookings/${mockPayment.bookingId}/status`,
        { status: 'Confirmed' }
      );
    });
    
    it('should handle payment not found for notification', async () => {
      Payment.findOne.mockResolvedValueOnce(null);
      
      const notification = {
        transaction_id: 'transaction-123',
        order_id: 'unknown-order',
        transaction_status: 'settlement'
      };
      
      await expect(paymentService.processNotification(notification)).rejects.toThrow(/Payment not found/);
    });
    
    it('should update payment status to failed for deny notification', async () => {
      midtransService.handleNotification.mockResolvedValueOnce({
        transactionStatus: 'deny',
        fraudStatus: 'deny',
        orderId: 'order-123'
      });
      
      const notification = {
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        transaction_status: 'deny',
        fraud_status: 'deny'
      };
      
      const result = await paymentService.processNotification(notification);
      
      expect(mockPayment.status).toBe('failed');
      expect(mockPayment.save).toHaveBeenCalled();
    });
  });
  
  describe('getPaymentStatus', () => {
    it('should get payment status', async () => {
      const paymentId = mockPayment._id.toString();
      
      const result = await paymentService.getPaymentStatus(paymentId);
      
      expect(result).toEqual(mockPayment);
      expect(Payment.findById).toHaveBeenCalledWith(paymentId);
    });
    
    it('should check status from Midtrans for pending payments', async () => {
      mockPayment.status = 'pending';
      
      const paymentId = mockPayment._id.toString();
      const result = await paymentService.getPaymentStatus(paymentId);
      
      expect(midtransService.getTransactionStatus).toHaveBeenCalledWith(mockPayment.midtransOrderId);
    });
    
    it('should throw error if payment not found', async () => {
      Payment.findById.mockResolvedValueOnce(null);
      
      const paymentId = 'non-existent-id';
      
      await expect(paymentService.getPaymentStatus(paymentId)).rejects.toThrow(/Payment not found/);
    });
  });
  
  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      const paymentId = mockPayment._id.toString();
      
      const result = await paymentService.cancelPayment(paymentId);
      
      expect(result.status).toBe('canceled');
      expect(midtransService.cancelTransaction).toHaveBeenCalledWith(mockPayment.midtransOrderId);
      expect(mockPayment.save).toHaveBeenCalled();
    });
    
    it('should throw error when trying to cancel successful payment', async () => {
      mockPayment.status = 'success';
      
      const paymentId = mockPayment._id.toString();
      
      await expect(paymentService.cancelPayment(paymentId)).rejects.toThrow(/Cannot cancel a successful payment/);
    });
  });
  
  describe('getUserPayments', () => {
    it('should get user payments with pagination', async () => {
      const userId = mockPayment.userId.toString();
      const options = { page: 2, limit: 10, status: 'success' };
      
      const result = await paymentService.getUserPayments(userId, options);
      
      expect(result).toEqual({
        payments: [mockPayment],
        pagination: {
          total: 1,
          page: 2,
          limit: 10,
          pages: 1
        }
      });
      
      expect(Payment.find).toHaveBeenCalledWith({ userId, status: 'success' });
      expect(Payment.countDocuments).toHaveBeenCalledWith({ userId, status: 'success' });
    });
  });
  
  describe('getPaymentsByBooking', () => {
    it('should get payments by booking ID', async () => {
      const bookingId = mockPayment.bookingId.toString();
      
      const result = await paymentService.getPaymentsByBooking(bookingId);
      
      expect(result).toEqual([mockPayment]);
      expect(Payment.find).toHaveBeenCalledWith({ bookingId });
    });
  });
});