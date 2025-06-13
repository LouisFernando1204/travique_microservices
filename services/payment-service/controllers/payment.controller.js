const { body } = require('express-validator');
const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/api.response');
const logger = require('../utils/logger');

const createPaymentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
];

const bankTransferValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('bank').isIn(['bca', 'bni', 'bri', 'mandiri', 'permata']).withMessage('Invalid bank selection'),
];

class PaymentController {
  /**
   * Create payment
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async createPayment(req, res, next) {
    try {
      const { bookingId, amount, userId } = req.body;
      
      const result = await paymentService.createPayment({
        bookingId,
        amount,
        userId
      });
      
      return ApiResponse.created(res, result, 'Payment initiated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process bank transfer
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async processBankTransfer(req, res, next) {
    try {
      const { bookingId, amount, bank } = req.body;
      const userId = req.user.id;
      
      const result = await paymentService.processBankTransfer({
        bookingId,
        userId,
        amount,
        bank
      });
      
      return ApiResponse.created(res, result, 'Bank transfer initiated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle notification from Midtrans
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async handleNotification(req, res, next) {
    try {
      const notification = req.body;
      
      logger.info('Received payment notification', { orderId: notification.order_id });
      
      const result = await paymentService.processNotification(notification);
      
      return ApiResponse.success(res, result, 'Notification processed successfully');
    } catch (error) {
      logger.error('Error processing payment notification', error);
      return res.status(200).send('OK');
    }
  }

  /**
   * Get payment status
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getPaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      const payment = await paymentService.getPaymentStatus(id);
      
      return ApiResponse.success(res, payment, 'Payment status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel payment
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async cancelPayment(req, res, next) {
    try {
      const { id } = req.params;
      
      const payment = await paymentService.cancelPayment(id);
      
      return ApiResponse.success(res, payment, 'Payment canceled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user payments
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserPayments(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit, status } = req.query;
      
      const result = await paymentService.getUserPayments(userId, {
        page,
        limit,
        status
      });
      
      return ApiResponse.success(res, result, 'User payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payments by booking
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getPaymentsByBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      
      const payments = await paymentService.getPaymentsByBooking(bookingId);
      
      return ApiResponse.success(res, payments, 'Booking payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  paymentController: new PaymentController(),
  createPaymentValidation,
  bankTransferValidation
};