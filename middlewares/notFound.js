const notFound = (req, res, next) => {
  const error = new Error(`הנתיב ${req.originalUrl} לא נמצא`);
  error.status = 404;
  error.type = 'Not Found';

  next(error);
};

module.exports = notFound;