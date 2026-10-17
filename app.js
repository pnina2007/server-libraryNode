const express = require('express');//השרת
const app = express(); //
const port = 5000;//מיקום השרת 

// ייבוא מערך הספרים מקובץ הנתונים
const { books } = require('./db');
const users = require('./usersDB');
const addCurrentDate = require('./middlewares/currentDate');
const router = require('./router/index.router');
const siteSchedule = require('./middlewares/siteSchedule');

// מאפשר לשרת לקרוא נתוני JSON שמגיעים בגוף הבקשה (req.body)
app.use(express.json());
app.use(addCurrentDate);
app.use(siteSchedule)
app.use('/api', router);

// הפעלת השרת בפורט 5000
app.listen(port, () => {
  console.log(`השרת רץ בכתובת: http://localhost:${port}`);
});