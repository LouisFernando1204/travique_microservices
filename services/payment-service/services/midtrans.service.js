const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');
const { initMidtransConfig } = require('../config/midtrans.config');

class MidtransService {
  constructor() {
    try {
      const { coreApi, snap } = initMidtransConfig();
      this.coreApi = coreApi;
      this.snap = snap;
      logger.info('Midtrans service initialized');
    } catch (error) {
      logger.error(`Failed to initialize Midtrans service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate transaction token with Snap
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async generateSnapToken(paymentData) {
    try {
      const {
        orderId,
        amount,
        customerDetails,
        itemDetails,
        callbackUrl
      } = paymentData;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        customer_details: customerDetails,
        item_details: itemDetails,
        callbacks: {
          finish: callbackUrl
        },
        expiry: {
          unit: 'hour',
          duration: 24
        }
      };

      const response = await this.snap.createTransaction(parameter);
      
      logger.info(`Snap token generated for order ${orderId}`);
      
      return {
        token: response.token,
        redirectUrl: response.redirect_url
      };
    } catch (error) {
      logger.error(`Error generating Snap token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create core API transaction
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async createTransaction(paymentData) {
    try {
      const {
        paymentType,
        orderId,
        amount,
        customerDetails,
        itemDetails,
        bankTransfer
      } = paymentData;

      const parameter = {
        payment_type: paymentType,
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        customer_details: customerDetails,
        item_details: itemDetails
      };

      if (paymentType === 'bank_transfer') {
        parameter.bank_transfer = bankTransfer;
      }

      const response = await this.coreApi.charge(parameter);
      
      logger.info(`Transaction created for order ${orderId} with payment type ${paymentType}`);
      
      return response;
    } catch (error) {
      logger.error(`Error creating transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction status
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async getTransactionStatus(orderId) {
    try {
      const response = await this.coreApi.transaction.status(orderId);
      
      logger.info(`Transaction status retrieved for order ${orderId}`);
      
      return response;
    } catch (error) {
      logger.error(`Error getting transaction status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle notification from Midtrans
   * @param {Object} notification
   * @returns {Promise<Object>}
   */
  async handleNotification(notification) {
    try {
      const statusResponse = await this.coreApi.transaction.notification(notification);
      
      logger.info(`Notification processed for order ${statusResponse.order_id}`);
      
      return {
        transactionStatus: statusResponse.transaction_status,
        fraudStatus: statusResponse.fraud_status,
        orderId: statusResponse.order_id,
        statusCode: statusResponse.status_code,
        paymentType: statusResponse.payment_type,
        rawResponse: statusResponse
      };
    } catch (error) {
      logger.error(`Error handling notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel transaction
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async cancelTransaction(orderId) {
    try {
      const response = await this.coreApi.transaction.cancel(orderId);
      
      logger.info(`Transaction canceled for order ${orderId}`);
      
      return response;
    } catch (error) {
      logger.error(`Error canceling transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refund transaction
   * @param {string} orderId
   * @param {number} amount
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  async refundTransaction(orderId, amount, reason) {
    try {
      const parameter = {
        amount: amount,
        reason: reason
      };
      
      const response = await this.coreApi.transaction.refund(orderId, parameter);
      
      logger.info(`Transaction refunded for order ${orderId}`);
      
      return response;
    } catch (error) {
      logger.error(`Error refunding transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate unique order ID
   * @param {string} prefix 
   * @returns {string}
   */
  generateOrderId(prefix = 'TRX') {
    const timestamp = new Date().getTime();
    const uniqueId = uuidv4().split('-')[0];
    return `${prefix}-${timestamp}-${uniqueId}`;
  }
}

module.exports = new MidtransService();