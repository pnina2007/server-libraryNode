// בדיקת תוכן הקובץ כדי לוודא שמדובר בתמונה
const validateImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const { fileTypeFromBuffer } = await import('file-type');
        const fileType = await fileTypeFromBuffer(req.file.buffer);

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        if (!fileType || !allowedTypes.includes(fileType.mime)) {
            const error = new Error('יש להעלות קובץ תמונה תקין בלבד');
            error.status = 400;
            error.type = 'Bad Request';
            return next(error);
        }

        // שומרים את סוג התמונה שזוהה לשימוש בהמשך
        req.imageFileType = fileType;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validateImage;