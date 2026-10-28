//מידלוור שמחזיר מידלוור לפי הסכמה שקיבלנו
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            //מאפשר לקבל את כל השגיאות ולא יעצר בשגיאה הראשונה
            abortEarly: false
        });

        if (error) {
            const err = new Error('שגיאות תקינות בבקשה');
            err.status = 400;
            err.type = 'Bad Request';
            err.details = error.details.map(detail => detail.message);
            return next(err);
        }

        next();
    };
};

module.exports = validate;
