const config = require('../config');
const Payment = require('../models/payment.model');
const midtransService = require('./midtrans.service');
const HttpClient = require('../utils/http.client');
const logger = require('../utils/logger');

const bookingClient = new HttpClient(config.services.booking.baseUrl, config.services.booking.timeout);

class PaymentService {
  /**
   * Create a new payment for a booking
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async createPayment(paymentData) {
    try {
      let { bookingId, amount, userId } = paymentData;
      
      // const booking = await this.getBookingDetails(bookingId);
      
      // if (!booking) {
      //   throw new Error(`Booking not found with ID: ${bookingId}`);
      // }
      
      // if (booking.status === 'Cancelled') {
      //   throw new Error(`Cannot process payment for cancelled booking: ${bookingId}`);
      // }


      // if (booking.totalPrice !== amount) {
      //   throw new Error(`Payment amount (${amount}) does not match booking total price (${booking.totalPrice})`);
      // }
      
      const midtransOrderId = midtransService.generateOrderId();
      amount = 150000;
      const payment = new Payment({
        bookingId,
        amount,
        userId,
        midtransOrderId,
        status: 'pending'
      });
      
      await payment.save();
      
      const itemDetails = [{
        id: bookingId,
        price: amount,
        quantity: 1,
        name: `Booking for `,
        category: 'Tourism'
      }];
      
      const snapResponse = await midtransService.generateSnapToken({
        orderId: midtransOrderId,
        amount: amount,
        customerDetails: {
          first_name: 'Customer',
          email: 'customer@example.com',
          phone: '08123456789'
        },
        itemDetails,
        callbackUrl: `${config.app.baseUrl}/payments/status/${payment._id}`
      });
      
      payment.snapToken = snapResponse.token;
      payment.paymentUrl = snapResponse.redirectUrl;
      payment.expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      
      await payment.save();
      
      // await this.updateBookingPayment(bookingId, payment._id);
      
      return {
        paymentId: payment._id,
        midtransOrderId: payment.midtransOrderId,
        snapToken: payment.snapToken,
        paymentUrl: payment.paymentUrl,
        expiryTime: payment.expiryTime,
        status: payment.status
      };
    } catch (error) {
      logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process bank transfer payment
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async processBankTransfer(paymentData) {
    try {
      const { bookingId, userId, amount, bank } = paymentData;
      
      const booking = await this.getBookingDetails(bookingId);
      
      if (!booking) {
        throw new Error(`Booking not found with ID: ${bookingId}`);
      }
      
      const midtransOrderId = midtransService.generateOrderId();
      
      const payment = new Payment({
        bookingId,
        userId,
        amount,
        midtransOrderId,
        bank,
        status: 'pending',
        paymentMethod: 'bank_transfer'
      });
      
      await payment.save();
      
      const response = await midtransService.createTransaction({
        paymentType: 'bank_transfer',
        orderId: midtransOrderId,
        amount: amount,
        customerDetails: {
          first_name: 'Customer',
          email: 'customer@example.com',
          phone: '08123456789'
        },
        itemDetails: [{
          id: bookingId,
          price: amount,
          quantity: 1,
          name: `Booking for ${booking.touristSpotId}`,
          category: 'Tourism'
        }],
        bankTransfer: {
          bank: bank
        }
      });
      
      payment.vaNumber = response.va_numbers[0].va_number;
      payment.expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      payment.paymentDetail = response;
      
      await payment.save();
      
      await this.updateBookingPayment(bookingId, payment._id);
      
      return {
        paymentId: payment._id,
        midtransOrderId: payment.midtransOrderId,
        vaNumber: payment.vaNumber,
        bank: payment.bank,
        expiryTime: payment.expiryTime,
        status: payment.status
      };
    } catch (error) {
      logger.error(`Error processing bank transfer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process payment notification from Midtrans
   * @param {Object} notification
   * @returns {Promise<Object>}
   */
  async processNotification(notification) {
    try {
      const notificationResult = await midtransService.handleNotification(notification);
      
      const payment = await Payment.findOne({ midtransOrderId: notificationResult.orderId });
      
      if (!payment) {
        throw new Error(`Payment not found with Midtrans Order ID: ${notificationResult.orderId}`);
      }
      
      payment.transactionId = notification.transaction_id;
      payment.transactionTime = new Date(notification.transaction_time);
      payment.paymentMethod = notification.payment_type;
      payment.fraudStatus = notificationResult.fraudStatus;
      payment.paymentDetail = notificationResult.rawResponse;
      
      switch (notificationResult.transactionStatus) {
        case 'capture':
        case 'settlement':
          payment.status = 'success';
          await this.updateBookingStatus(payment.bookingId, 'Confirmed');
          break;
        case 'pending':
          payment.status = 'pending';
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
          payment.status = notificationResult.transactionStatus === 'deny' ? 'failed' : 
                          notificationResult.transactionStatus === 'cancel' ? 'canceled' : 'expired';
          break;
        case 'refund':
        case 'partial_refund':
          payment.status = 'refunded';
          break;
      }
      
      await payment.save();
      
      logger.info(`Payment ${payment._id} updated with status: ${payment.status} for booking ${payment.bookingId}`);
      
      return {
        paymentId: payment._id,
        status: payment.status,
        bookingId: payment.bookingId
      };
    } catch (error) {
      logger.error(`Error processing notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error(`Payment not found with ID: ${paymentId}`);
      }
      
      if (payment.status === 'pending') {
        try {
          const statusResponse = await midtransService.getTransactionStatus(payment.midtransOrderId);
          
          if (statusResponse.transaction_status !== payment.status) {
            const updatedPayment = await this.updatePaymentStatus(payment, statusResponse);
            return updatedPayment;
          }
        } catch (error) {
          logger.error(`Error checking Midtrans status for payment ${paymentId}: ${error.message}`);
        }
      }
      
      return payment;
    } catch (error) {
      logger.error(`Error getting payment status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update payment status
   * @param {Object} payment 
   * @param {Object} statusResponse 
   * @returns {Promise<Object>}
   */
  async updatePaymentStatus(payment, statusResponse) {
    try {
      payment.transactionId = statusResponse.transaction_id || payment.transactionId;
      payment.transactionTime = statusResponse.transaction_time ? new Date(statusResponse.transaction_time) : payment.transactionTime;
      payment.fraudStatus = statusResponse.fraud_status || payment.fraudStatus;
      payment.paymentDetail = statusResponse;
      
      switch (statusResponse.transaction_status) {
        case 'capture':
        case 'settlement':
          payment.status = 'success';
          await this.updateBookingStatus(payment.bookingId, 'Confirmed');
          break;
        case 'pending':
          payment.status = 'pending';
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
          payment.status = statusResponse.transaction_status === 'deny' ? 'failed' : 
                          statusResponse.transaction_status === 'cancel' ? 'canceled' : 'expired';
          break;
        case 'refund':
        case 'partial_refund':
          payment.status = 'refunded';
          break;
      }
      
      await payment.save();
      
      logger.info(`Payment ${payment._id} status updated to ${payment.status}`);
      
      return payment;
    } catch (error) {
      logger.error(`Error updating payment status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel payment
   * @param {string} paymentId
   * @returns {Promise<Object>}
   */
  async cancelPayment(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error(`Payment not found with ID: ${paymentId}`);
      }
      
      if (payment.status === 'success') {
        throw new Error('Cannot cancel a successful payment');
      }
      
      await midtransService.cancelTransaction(payment.midtransOrderId);
      
      payment.status = 'canceled';
      await payment.save();
      
      logger.info(`Payment ${paymentId} canceled`);
      
      return payment;
    } catch (error) {
      logger.error(`Error canceling payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user payments
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getUserPayments(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      
      const query = { userId };
      if (status) {
        query.status = status;
      }
      
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Payment.countDocuments(query);
      
      return {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error getting user payments: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get payments by booking ID
   * @param {string} bookingId
   * @returns {Promise<Array>}
   */
  async getPaymentsByBooking(bookingId) {
    try {
      const payments = await Payment.find({ bookingId }).sort({ createdAt: -1 });
      return payments;
    } catch (error) {
      logger.error(`Error getting payments by booking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get booking details from booking service
   * @param {string} bookingId
   * @returns {Promise<Object>}
   */
  async getBookingDetails(bookingId) {
    try {
      const response = await bookingClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting booking details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update booking payment ID
   * @param {string} bookingId
   * @param {string} paymentId
   * @returns {Promise<Object>}
   */
  async updateBookingPayment(bookingId, paymentId) {
    try {
      const response = await bookingClient.patch(`/api/bookings/${bookingId}/payment`, { paymentId });
      return response.data;
    } catch (error) {
      logger.error(`Error updating booking payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update booking status
   * @param {string} bookingId
   * @param {string} status
   * @returns {Promise<Object>}
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await bookingClient.patch(`/api/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      logger.error(`Error updating booking status: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PaymentService();