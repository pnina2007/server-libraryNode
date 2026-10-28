//מגדיר איפה ישמר הקובץ וההגדרות שלו
const multer = require('multer');

// שמירה זמנית בזיכרון עד שהתמונה תיבדק
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    }
});

module.exports = upload;