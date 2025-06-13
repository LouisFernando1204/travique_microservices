const express = require('express');
const { paymentController, createPaymentValidation, bankTransferValidation } = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - bookingId
 *         - userId
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the payment
 *         bookingId:
 *           type: string
 *           description: ID of the associated booking
 *         userId:
 *           type: string
 *           description: ID of the user who made the payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           description: Currency of the payment
 *           default: IDR
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, bank_transfer, gopay, shopeepay, qris, other]
 *           description: Payment method used
 *         status:
 *           type: string
 *           enum: [pending, success, failed, expired, canceled, refunded]
 *           default: pending
 *           description: Current status of the payment
 *         midtransOrderId:
 *           type: string
 *           description: Order ID from Midtrans
 *         snapToken:
 *           type: string
 *           description: Snap token for payment
 *         paymentUrl:
 *           type: string
 *           description: URL for payment redirect
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the payment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the payment was last updated
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - bookingId
 *         - amount
 *       properties:
 *         bookingId:
 *           type: string
 *           description: ID of the booking to pay for
 *         amount:
 *           type: number
 *           description: Amount to pay
 *     BankTransferRequest:
 *       type: object
 *       required:
 *         - bookingId
 *         - amount
 *         - bank
 *       properties:
 *         bookingId:
 *           type: string
 *           description: ID of the booking to pay for
 *         amount:
 *           type: number
 *           description: Amount to pay
 *         bank:
 *           type: string
 *           enum: [bca, bni, bri, mandiri, permata]
 *           description: Bank for transfer
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         message:
 *           type: string
 *           description: Message describing the result
 *         data:
 *           type: object
 *           description: Response data
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     description: Create a payment and generate a payment token
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment initiated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     midtransOrderId:
 *                       type: string
 *                       example: TRX-1624352342-a1b2c3
 *                     snapToken:
 *                       type: string
 *                       example: 66e4fa55-fdac-4ef9-91b5-733b97d1b862
 *                     paymentUrl:
 *                       type: string
 *                       example: https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/', 
  createPaymentValidation, 
  validate, 
  paymentController.createPayment
);

/**
 * @swagger
 * /api/payments/bank-transfer:
 *   post:
 *     summary: Create bank transfer payment
 *     description: Process a payment via bank transfer
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankTransferRequest'
 *     responses:
 *       201:
 *         description: Bank transfer initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bank transfer initiated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     midtransOrderId:
 *                       type: string
 *                       example: TRX-1624352342-a1b2c3
 *                     vaNumber:
 *                       type: string
 *                       example: 12345678901
 *                     bank:
 *                       type: string
 *                       example: bca
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/bank-transfer', 
  authenticate, 
  bankTransferValidation, 
  validate, 
  paymentController.processBankTransfer
);

/**
 * @swagger
 * /api/payments/notifications:
 *   post:
 *     summary: Handle Midtrans notifications
 *     description: Process payment status notifications from Midtrans
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *               transaction_status:
 *                 type: string
 *               fraud_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification processed successfully
 */
router.post(
  '/notifications', 
  paymentController.handleNotification
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment status
 *     description: Get the status of a payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment status retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id', 
  authenticate, 
  paymentController.getPaymentStatus
);

/**
 * @swagger
 * /api/payments/{id}/cancel:
 *   post:
 *     summary: Cancel payment
 *     description: Cancel a pending payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment canceled successfully
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/cancel', 
  authenticate, 
  paymentController.cancelPayment
);

/**
 * @swagger
 * /api/payments/user/me:
 *   get:
 *     summary: Get user payments
 *     description: Get all payments for the authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, expired, canceled, refunded]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: List of user payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User payments retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 2
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/user/me', 
  authenticate, 
  paymentController.getUserPayments
);

/**
 * @swagger
 * /api/payments/booking/{bookingId}:
 *   get:
 *     summary: Get payments by booking
 *     description: Get all payments for a specific booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: List of payments for the booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking payments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/booking/:bookingId', 
  authenticate, 
  paymentController.getPaymentsByBooking
);

module.exports = router;