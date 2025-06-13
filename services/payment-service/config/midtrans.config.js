const midtransClient = require('midtrans-client');
const logger = require('../utils/logger');

const initMidtransConfig = () => {
  try {
    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    logger.info('Midtrans configured successfully');

    return { coreApi, snap };
  } catch (error) {
    logger.error(`Error configuring Midtrans: ${error.message}`);
    throw error;
  }
};

module.exports = { initMidtransConfig };