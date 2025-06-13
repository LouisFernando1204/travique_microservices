import axios from "axios";

const PAYMENT_APIGATEWAY_URL = "http://localhost:3500/service/payment-service";

function handleError(error) {
    return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Internal Server Error",
        detail: error.response?.data || null,
    };
}

// === PAYMENT ROUTES ===

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data (bookingId, amount)
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response with status and data
 */
export async function createPayment(paymentData, token) {
    try {
        const res = await axios.post(`${PAYMENT_APIGATEWAY_URL}/payments`, paymentData, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Create bank transfer payment
 * @param {Object} bankTransferData - Bank transfer data (bookingId, amount, bank)
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response with status and data
 */
export async function createBankTransferPayment(bankTransferData, token) {
    try {
        const res = await axios.post(
            `${PAYMENT_APIGATEWAY_URL}/payments/bank-transfer`,
            bankTransferData,
            {
                headers: { Authorization: token },
            }
        );
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Handle Midtrans payment notifications (typically used by Midtrans webhook)
 * @param {Object} notificationData - Notification data from Midtrans
 * @returns {Promise<Object>} Response with status and data
 */
export async function handlePaymentNotification(notificationData) {
    try {
        const res = await axios.post(
            `${PAYMENT_APIGATEWAY_URL}/payments/notifications`,
            notificationData
        );
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Get payment status by payment ID
 * @param {string} paymentId - Payment ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response with status and data
 */
export async function getPaymentStatus(paymentId, token) {
    try {
        const res = await axios.get(`${PAYMENT_APIGATEWAY_URL}/payments/${paymentId}`, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Cancel a pending payment
 * @param {string} paymentId - Payment ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response with status and data
 */
export async function cancelPayment(paymentId, token) {
    try {
        const res = await axios.post(
            `${PAYMENT_APIGATEWAY_URL}/payments/${paymentId}/cancel`,
            {},
            {
                headers: { Authorization: token },
            }
        );
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Get all payments for the authenticated user
 * @param {string} token - Authorization token
 * @param {Object} queryParams - Query parameters (page, limit, status)
 * @returns {Promise<Object>} Response with status and data
 */
export async function getUserPayments(token, queryParams = {}) {
    try {
        const res = await axios.get(`${PAYMENT_APIGATEWAY_URL}/payments/user/me`, {
            headers: { Authorization: token },
            params: queryParams,
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Get all payments for a specific booking
 * @param {string} bookingId - Booking ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response with status and data
 */
export async function getPaymentsByBooking(bookingId, token) {
    try {
        const res = await axios.get(
            `${PAYMENT_APIGATEWAY_URL}/payments/booking/${bookingId}`,
            {
                headers: { Authorization: token },
            }
        );
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

// === UTILITY FUNCTIONS ===

/**
 * Get user payments with pagination
 * @param {string} token - Authorization token
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} status - Payment status filter (optional)
 * @returns {Promise<Object>} Response with status and data
 */
export async function getUserPaymentsPaginated(token, page = 1, limit = 10, status = null) {
    const queryParams = { page, limit };
    if (status) {
        queryParams.status = status;
    }
    return getUserPayments(token, queryParams);
}

/**
 * Check if payment is successful
 * @param {string} paymentId - Payment ID
 * @param {string} token - Authorization token
 * @returns {Promise<boolean>} True if payment is successful
 */
export async function isPaymentSuccessful(paymentId, token) {
    try {
        const response = await getPaymentStatus(paymentId, token);
        return response.status === 200 && response.data?.data?.status === 'success';
    } catch (error) {
        console.error('Error checking payment status:', error);
        return false;
    }
}

/**
 * Get payment methods enum for frontend use
 * @returns {Object} Payment methods object
 */
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    BANK_TRANSFER: 'bank_transfer',
    GOPAY: 'gopay',
    SHOPEEPAY: 'shopeepay',
    QRIS: 'qris',
    OTHER: 'other'
};

/**
 * Get payment status enum for frontend use
 * @returns {Object} Payment status object
 */
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    EXPIRED: 'expired',
    CANCELED: 'canceled',
    REFUNDED: 'refunded'
};

/**
 * Get available banks for bank transfer
 * @returns {Object} Banks object
 */
export const BANKS = {
    BCA: 'bca',
    BNI: 'bni',
    BRI: 'bri',
    MANDIRI: 'mandiri',
    PERMATA: 'permata'
};