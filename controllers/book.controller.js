const Book = require('../models/book.model');
const users = require('../usersDB');
const {
  bookSchema,
  updateBookSchema
} = require('../validations/book.validation');

const fs = require('fs/promises');
const path = require('path');

/// שמירת התמונה בתיקיית public
const saveUploadedImage = async (req, bookCode) => {
  if (!req.file) return null;

  const fileType = req.imageFileType;
  const timestamp = Date.now();
  const filename = `${bookCode}-${timestamp}.${fileType.ext}`;
  const publicDir = path.join(__dirname, '..', 'public');
//שם את התמונה בתקייה ושם את השם שרצינו על התמונה הזו..
  await fs.writeFile(path.join(publicDir, filename), req.file.buffer);

  return filename;
};


// 1
// קבלת כל הספרים עם אפשרות חיפוש, סינון וחלוקה לעמודים 
const getAllBooks = async (req, res, next) => {
  try {
    // query והגדרת ברירות מחדל
    const { title, category, page = 1, limit = 5 } = req.query;

    // הגדרת תנאי החיפוש
    const filter = {};

    // 1. חיפוש לפי שם ספר (אם נשלח)
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    // חיפוש לפי קטגוריה (אם נשלח)
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // חישוב חלוקה לעמודים (Pagination)
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const startIndex = (pageNumber - 1) * limitNumber;

    // שליפת הספרים ממסד הנתונים לפי החיפוש והעמוד המבוקש
    const paginatedBooks = await Book.find(filter)
      .skip(startIndex)
      .limit(limitNumber);

    const totalBooks = await Book.countDocuments(filter);

    // החזרת התוצאה ללקוח יחד עם פרטי העמוד
    res.json({
      currentPage: pageNumber,       // באיזה עמוד הלקוח נמצא כרגע
      pageSize: paginatedBooks.length, // כמה ספרים יש בפועל בעמוד הזה
      totalBooks: totalBooks, // סך הכל כל הספרים שענו על החיפוש
      books: paginatedBooks          // רשימת הספרים עצמה של אותו עמוד
    });
  } catch (error) {
    next(error);
  }
};


// 2. קבלת ספר לפי קוד
const getBookByCode = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const book = await Book.findOne({ code: bookCode });

    if (!book) {
      const error = new Error('הספר לא נמצא במערכת');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);     //שולח למטפל שגיאות המרכזי
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
};


// 3. הוספת ספר חדש
const addBook = async (req, res, next) => {
  try {
    // מציאת הקוד האחרון במסד הנתונים כדי ליצור קוד חדש
    const lastBook = await Book.findOne().sort({ code: -1 });
    const code = lastBook ? lastBook.code + 1 : 1;

    const image = await saveUploadedImage(req, code);

    const newBook = new Book({
      code,
      title: req.body.title,
      category: req.body.category,
      price: req.body.price,
      isBorrowed: false,
      borrowHistory: [],
      ...(image ? { image } : {})
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
};

// 4. עדכון ספר קיים לפי קוד (מלבד שדות השאלה)
const updateBook = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const book = await Book.findOne({ code: bookCode });

    if (!book) {
      const error = new Error('הספר לא נמצא במערכת לא ניתן לעדכן');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);
    }

    const image = await saveUploadedImage(req, bookCode);
    if (image) book.image = image;

    book.title = req.body.title || book.title;
    book.category = req.body.category || book.category;
    book.price = req.body.price !== undefined
      ? req.body.price
      : book.price;

    await book.save();

    res.json({ message: 'הספר עודכן בהצלחה', book });
  } catch (error) {
    next(error);
  }
};


// 5. ביצוע השאלה
const borrowBook = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const book = await Book.findOne({ code: bookCode });

    if (!book) {
      const error = new Error('הספר לא נמצא במערכת');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);
    }

    if (book.isBorrowed) {
      const error = new Error('הספר כבר מושאל ');
      error.status = 400;
      error.type = 'Bad Request';
      return next(error);
    }

    const { customerCode, borrowDate } = req.body;
    // מציאת המשתמש שהשאיל את הספר
    const user = users.find(user => user.code === Number(customerCode));
    //  והשאלה והוספת קוד הספר למערך הספרים המושאלים של המשתמש
    if (user) {
      user.borrowedBooks.push(book.code);
      book.isBorrowed = true;
      book.borrowHistory.push({
        borrowDate: borrowDate || new Date().toISOString().split('T')[0],
        customerCode: customerCode
      });

      await book.save();
    }
    else {
      const error = new Error('המשתמש לא קיים במערכת');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);
    }

    res.json({ message: 'הספר הושאל בהצלחה', book });
  } catch (error) {
    next(error);
  }
};



// 6. ביצוע החזרה
const returnBook = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const book = await Book.findOne({ code: bookCode });

    if (!book) {
      const error = new Error('הספר לא נמצא במערכת');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);
    }

    if (!book.isBorrowed) {
      const error = new Error('הספר כלל אינו מושאל');
      error.status = 400;
      error.type = 'Bad Request';
      return next(error);
    }

    // מציאת ההשאלה האחרונה של הספר
    const lastBorrow = book.borrowHistory[book.borrowHistory.length - 1];

    // מציאת המשתמש שהשאיל את הספר
    const user = users.find(
      user => user.code === Number(lastBorrow.customerCode)
    );

    // עדכון מערך הספרים של המשתמש
    if (user) {
      user.borrowedBooks = user.borrowedBooks.filter(
        code => code !== book.code
      );
    }

    // סימון הספר כפנוי
    book.isBorrowed = false;

    await book.save();

    res.json({ message: 'הספר הוחזר בהצלחה', book });
  } catch (error) {
    next(error);
  }
};


// 7. מחיקת ספר לפי קוד
const deleteBook = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const deletedBook = await Book.findOneAndDelete({ code: bookCode });

    if (!deletedBook) {
      const error = new Error('הספר לא נמצא במערכת');
      error.status = 404;
      error.type = 'Not Found';
      return next(error);
    }

    res.json({ message: 'הספר נמחק בהצלחה', deletedBook });
  } catch (error) {
    next(error);
  }
};


// ייצוא הפונקציות כדי ש-book.router.js יוכל להשתמש בהן
module.exports = {
  getAllBooks,
  getBookByCode,
  addBook,
  updateBook,
  borrowBook,
  returnBook,
  deleteBook
};