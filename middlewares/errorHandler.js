const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    res.status(status).json({
        error: {
            message: err.message || 'Server Error',
            type: err.type || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            })
        }
    });
};

module.exports = errorHandler;