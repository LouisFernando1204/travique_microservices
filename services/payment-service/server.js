const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db.config');
const paymentRoutes = require('./routes/payment.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const os = require('os');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(compression());

app.use(morgan('combined', { stream: logger.stream }));

app.get('/health', (req, res) => {
    const hostname = os.hostname();
    const networkInterfaces = os.networkInterfaces();
    
    let ipAddress = 'unknown';
    Object.keys(networkInterfaces).forEach(interfaceName => {
      const interfaces = networkInterfaces[interfaceName];
      const ipv4Interface = interfaces.find(iface => iface.family === 'IPv4' && !iface.internal);
      if (ipv4Interface) {
        ipAddress = ipv4Interface.address;
      }
    });
    
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024));
    const freeMemory = Math.round(os.freemem() / (1024 * 1024));
    const usedMemoryPercentage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
    
    const response = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: config.app.name,
      version: process.env.npm_package_version || '1.0.0',
      
      container: {
        hostname: hostname,
        ipAddress: ipAddress,
        serviceName: process.env.SERVICE_NAME || 'payment-service'
      },
      
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        uptime: Math.floor(os.uptime() / 60) + ' minutes',
        memory: {
          total: totalMemory + ' MB',
          free: freeMemory + ' MB',
          used: usedMemoryPercentage + '%'
        }
      },
      
      requestCount: global.requestCount = (global.requestCount || 0) + 1
    };
    
    res.status(200).json(response);
  });
  
  app.get('/server-info', (req, res) => {
    res.status(200).json({
      headers: req.headers,
      remoteAddress: req.socket.remoteAddress,
      remotePort: req.socket.remotePort,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      hostname: req.hostname
    });
  });

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Payment Service API',
        version: '1.0.0',
        description: 'Payment Service API for Travique',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: `http://localhost:8080`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{
        bearerAuth: []
      }]
    },
    apis: ['./routes/*.js', './controllers/*.js', './models/*.js', './server.js']
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = config.app.port;
app.listen(PORT, () => {
  logger.info(`Server running in ${config.app.env} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

module.exports = app;