require('dotenv').config();

const config = {
  app: {
    name: 'payment-service',
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/payment-service',
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    isProduction: process.env.NODE_ENV === 'production',
    merchantId: process.env.MIDTRANS_MERCHANT_ID,
    notificationUrl: process.env.MIDTRANS_NOTIFICATION_URL || 'https://api.yourdomain.com/api/payments/notifications',
  },
  services: {
    booking: {
      baseUrl: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3001',
      timeout: parseInt(process.env.BOOKING_SERVICE_TIMEOUT || '5000'),
    },
    auth: {
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000'),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  }
};

module.exports = config;