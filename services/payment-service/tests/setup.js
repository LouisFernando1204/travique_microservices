const mongoose = require('mongoose');
const logger = require('../utils/logger');

logger.transports.forEach((transport) => {
  transport.silent = true;
});

process.env.NODE_ENV = 'test';
process.env.PORT = 3002;
process.env.MONGO_URI = 'mongodb://localhost:27017/payment-service-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-XXXXXXXXXXX';
process.env.MIDTRANS_CLIENT_KEY = 'SB-Mid-client-XXXXXXXXXXX';

beforeAll(async () => {
  jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve(mongoose));
  
  jest.spyOn(mongoose.connection, 'on').mockImplementation(() => mongoose.connection);
});

afterAll(async () => {
  jest.restoreAllMocks();
  
  mongoose.connect.mockRestore();
  mongoose.connection.on.mockRestore();
});