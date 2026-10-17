const logGetDate = (req, res, next) => {
    console.log(req.currentDate); //מדפיס
    next();
};

module.exports = logGetDate;