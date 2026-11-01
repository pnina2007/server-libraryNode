const errorHandler = (err, req, res, next) => {

    // בדיקה אם הקובץ שהועלה גדול מהמותר
    if (err.code === 'LIMIT_FILE_SIZE') {
        err.status = 400;
        err.type = 'Bad Request';
        err.message = 'קובץ התמונה גדול מדי. הגודל המקסימלי הוא 1MB';
    }

    const status = err.status || 500;

    res.status(status).json({
        error: {
            message: err.message || 'Server Error',
            type: err.type || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            }),
            details: err.details
        }
    });
};

module.exports = errorHandler;