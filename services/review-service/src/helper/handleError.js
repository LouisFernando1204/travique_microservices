
const handleError = (res, err, customMessage) => {
    const dbErrors = [
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'buffering timed out',
        'timeout',
        'failed to connect'
    ];

    const isDbError = dbErrors.some(code =>
        (err.message && err.message.toLowerCase().includes(code.toLowerCase())) || err.code === code
    );

    res.status(500).json({
        status: 'error',
        message: isDbError ? 'Tidak dapat terhubung ke database' : customMessage,
        error: err.message
    });
};

module.exports = { handleError };
