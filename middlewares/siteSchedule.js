const createSiteScheduleMiddleware = (inactiveDays) => {
    return (req, res, next) => {
        const currentDate = req.currentDate;
        const day = currentDate.getDay();
        const hour = currentDate.getHours();

        const blocked = inactiveDays.some(item => {
            return day === item.day && hour >= item.fromHour;
        });

        // חסימה מיום שישי בצהריים ועד שבת בשעה 22:00
        if (blocked || (day === 6 && hour < 22)) {
            return res.status(503).json({
                message: 'האתר אינו פעיל כעת'
            });
        }

        next();
    };
};

const siteSchedule = createSiteScheduleMiddleware([
    { day: 5, fromHour: 12 }
]);

module.exports = siteSchedule;