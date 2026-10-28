const express = require('express');//השרת
const app = express(); //
const port = 5000;//מיקום השרת 
app.use(express.static('public'));

const morgan = require('morgan'); //שנוכל לראות מידע על הבקשה שהגיע לשרת 
const cors = require('cors');     //מאפשר לקלינטים לגשת לשרת ללא חסימה
// ייבוא מערך הספרים מקובץ הנתונים
const { books } = require('./db');
const users = require('./usersDB');
const addCurrentDate = require('./middlewares/currentDate');
const router = require('./router/index.js');
const siteSchedule = require('./middlewares/siteSchedule');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// מגביל כל כתובת IP ל-40 בקשות בכל 15 דקות
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40
});

// מאפשר לשרת לקרוא נתוני JSON שמגיעים בגוף הבקשה (req.body)
app.use(express.json());
// מגביל את מספר הבקשות כדי לצמצם עומס ושימוש לרעה
app.use(limiter);
// מוסיף כותרות HTTP לשיפור אבטחת השרת
app.use(helmet());
// מדפיס פרטים על בקשות HTTP במצב פיתוח
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// מאפשר לקלינט לשלוח בקשות לשרת ממקורות אחרים
app.use(cors());
app.use(addCurrentDate);
app.use(siteSchedule);
app.use('/api', router);
// טיפול בנתיב שלא נמצא — אחרי כל הנתיבים
app.use(notFound);

// מטפל בשגיאות שנשלחו אליו מכל הפרויקט
app.use(errorHandler);


// הפעלת השרת בפורט 5000
app.listen(port, () => {
  console.log(`השרת רץ בכתובת: http://localhost:${port}`);
});