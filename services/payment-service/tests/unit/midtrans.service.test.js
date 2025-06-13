const midtransClient = require('midtrans-client');
const midtransService = require('../../services/midtrans.service');

jest.mock('midtrans-client', () => {
  return {
    Snap: jest.fn().mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue({
        token: 'snap-token-123',
        redirect_url: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123'
      })
    })),
    CoreApi: jest.fn().mockImplementation(() => ({
      charge: jest.fn().mockResolvedValue({
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        gross_amount: '50000.00',
        payment_type: 'bank_transfer',
        transaction_status: 'pending',
        fraud_status: 'accept',
        va_numbers: [{ bank: 'bca', va_number: '12345678901' }]
      }),
      transaction: {
        status: jest.fn().mockResolvedValue({
          transaction_id: 'transaction-123',
          order_id: 'order-123',
          gross_amount: '50000.00',
          transaction_status: 'settlement',
          fraud_status: 'accept'
        }),
        notification: jest.fn().mockResolvedValue({
          transaction_id: 'transaction-123',
          order_id: 'order-123',
          gross_amount: '50000.00',
          transaction_status: 'settlement',
          fraud_status: 'accept'
        }),
        cancel: jest.fn().mockResolvedValue({
          transaction_id: 'transaction-123',
          order_id: 'order-123',
          status_code: '200',
          status_message: 'Success, transaction is canceled'
        }),
        refund: jest.fn().mockResolvedValue({
          transaction_id: 'transaction-123',
          order_id: 'order-123',
          status_code: '200',
          status_message: 'Success, refund is approved'
        })
      }
    }))
  };
});

describe('Midtrans Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSnapToken', () => {
    it('should successfully generate a snap token', async () => {
      const paymentData = {
        orderId: 'order-123',
        amount: 50000,
        customerDetails: {
          first_name: 'John',
          email: 'john@example.com'
        },
        itemDetails: [
          {
            id: 'item1',
            price: 50000,
            quantity: 1,
            name: 'Test Item'
          }
        ],
        callbackUrl: 'https://example.com/payment-callback'
      };

      const result = await midtransService.generateSnapToken(paymentData);

      expect(result).toEqual({
        token: 'snap-token-123',
        redirectUrl: 'https://app.midtrans.com/snap/v2/vtweb/snap-token-123'
      });
      
      expect(midtransClient.Snap).toHaveBeenCalled();
      const mockSnap = midtransClient.Snap.mock.results[0].value;
      expect(mockSnap.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        transaction_details: {
          order_id: 'order-123',
          gross_amount: 50000
        }
      }));
    });

    it('should throw an error when snap creation fails', async () => {
      const mockImplementation = {
        createTransaction: jest.fn().mockRejectedValue(new Error('Snap error'))
      };
      midtransClient.Snap.mockImplementation(() => mockImplementation);

      const paymentData = {
        orderId: 'order-123',
        amount: 50000,
        customerDetails: {},
        itemDetails: []
      };

      await expect(midtransService.generateSnapToken(paymentData)).rejects.toThrow('Snap error');
    });
  });

  describe('createTransaction', () => {
    it('should successfully create a transaction', async () => {
      const paymentData = {
        paymentType: 'bank_transfer',
        orderId: 'order-123',
        amount: 50000,
        customerDetails: {
          first_name: 'John',
          email: 'john@example.com'
        },
        itemDetails: [
          {
            id: 'item1',
            price: 50000,
            quantity: 1,
            name: 'Test Item'
          }
        ],
        bankTransfer: {
          bank: 'bca'
        }
      };

      const result = await midtransService.createTransaction(paymentData);

      expect(result).toEqual(expect.objectContaining({
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        gross_amount: '50000.00',
        payment_type: 'bank_transfer'
      }));
      
      expect(midtransClient.CoreApi).toHaveBeenCalled();
      const mockCoreApi = midtransClient.CoreApi.mock.results[0].value;
      expect(mockCoreApi.charge).toHaveBeenCalledWith(expect.objectContaining({
        payment_type: 'bank_transfer',
        transaction_details: {
          order_id: 'order-123',
          gross_amount: 50000
        }
      }));
    });
  });

  describe('getTransactionStatus', () => {
    it('should successfully get transaction status', async () => {
      const orderId = 'order-123';

      const result = await midtransService.getTransactionStatus(orderId);

      expect(result).toEqual(expect.objectContaining({
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        transaction_status: 'settlement'
      }));
      
      const mockCoreApi = midtransClient.CoreApi.mock.results[0].value;
      expect(mockCoreApi.transaction.status).toHaveBeenCalledWith(orderId);
    });
  });

  describe('handleNotification', () => {
    it('should successfully handle notification', async () => {
      const notification = {
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        status_code: '200',
        gross_amount: '50000.00',
        payment_type: 'bank_transfer',
        transaction_status: 'settlement'
      };

      const result = await midtransService.handleNotification(notification);

      expect(result).toEqual(expect.objectContaining({
        transactionStatus: 'settlement',
        orderId: 'order-123'
      }));
      
      const mockCoreApi = midtransClient.CoreApi.mock.results[0].value;
      expect(mockCoreApi.transaction.notification).toHaveBeenCalledWith(notification);
    });
  });

  describe('cancelTransaction', () => {
    it('should successfully cancel a transaction', async () => {
      const orderId = 'order-123';

      const result = await midtransService.cancelTransaction(orderId);

      expect(result).toEqual(expect.objectContaining({
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        status_code: '200',
        status_message: 'Success, transaction is canceled'
      }));
      
      const mockCoreApi = midtransClient.CoreApi.mock.results[0].value;
      expect(mockCoreApi.transaction.cancel).toHaveBeenCalledWith(orderId);
    });
  });

  describe('refundTransaction', () => {
    it('should successfully refund a transaction', async () => {
      const orderId = 'order-123';
      const amount = 50000;
      const reason = 'Customer request';

      const result = await midtransService.refundTransaction(orderId, amount, reason);

      expect(result).toEqual(expect.objectContaining({
        transaction_id: 'transaction-123',
        order_id: 'order-123',
        status_code: '200',
        status_message: 'Success, refund is approved'
      }));
      
      const mockCoreApi = midtransClient.CoreApi.mock.results[0].value;
      expect(mockCoreApi.transaction.refund).toHaveBeenCalledWith(orderId, {
        amount: amount,
        reason: reason
      });
    });
  });

  describe('generateOrderId', () => {
    it('should generate a unique order ID with prefix', () => {
      const result = midtransService.generateOrderId('TEST');
      
      expect(result).toMatch(/^TEST-\d+-[a-f0-9]+$/);
    });

    it('should use default prefix when not provided', () => {
      const result = midtransService.generateOrderId();
      
      expect(result).toMatch(/^TRX-\d+-[a-f0-9]+$/);
    });
  });
});