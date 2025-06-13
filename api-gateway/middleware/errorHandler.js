const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errLog.log');
    console.log(err.stack);

    const status = res.statusCode ? res.statusCode : 500;
    res.status(status).json({ message: err.message });
};

module.exports = errorHandler;