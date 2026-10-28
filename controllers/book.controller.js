
const { books } = require('../db');
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

  await fs.writeFile(path.join(publicDir, filename), req.file.buffer);

  return filename;
};


// 1
// קבלת כל הספרים עם אפשרות חיפוש, סינון וחלוקה לעמודים 
const getAllBooks = (req, res) => {
  // עותק של מערך הספרים בלי לשנות את המקור
  let filteredBooks = [...books];

  // query והגדרת ברירות מחדל
  const { title, category, page = 1, limit = 5 } = req.query;

  // 1. חיפוש לפי שם ספר (אם נשלח)
  if (title) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  // חיפוש לפי קטגוריה (אם נשלח)
  if (category) {
    filteredBooks = filteredBooks.filter(book =>
      book.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // חישוב חלוקה לעמודים (Pagination)
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = pageNumber * limitNumber;

  // חיתוך המערך לפי העמוד המבוקש
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  // החזרת התוצאה ללקוח יחד עם פרטי העמוד
  res.json({
    currentPage: pageNumber,       // באיזה עמוד הלקוח נמצא כרגע
    pageSize: paginatedBooks.length, // כמה ספרים יש בפועל בעמוד הזה
    totalBooks: filteredBooks.length, // סך הכל כל הספרים שענו על החיפוש
    books: paginatedBooks          // רשימת הספרים עצמה של אותו עמוד
  });
};


// 2. קבלת ספר לפי קוד
const getBookByCode = (req, res, next) => {
  const bookCode = parseInt(req.params.code);
  const book = books.find(b => b.code === bookCode);

  if (!book) {
  const error = new Error('הספר לא נמצא במערכת');
  error.status = 404;
  error.type = 'Not Found';
  return next(error);     //שולח למטפל שגיאות המרכזי
}

  res.json(book);
};


// 3. הוספת ספר חדש
const addBook = async (req, res, next) => {
  try {
    const code = books.length > 0
      ? books[books.length - 1].code + 1
      : 1;

    const image = await saveUploadedImage(req, code);

    const newBook = {
      code,
      title: req.body.title,
      category: req.body.category,
      price: req.body.price,
      isBorrowed: false,
      borrowHistory: [],
      ...(image ? { image } : {})
    };

    books.push(newBook);
    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
};

// 4. עדכון ספר קיים לפי קוד (מלבד שדות השאלה)
const updateBook = async (req, res, next) => {
  try {
    const bookCode = parseInt(req.params.code);
    const book = books.find(b => b.code === bookCode);

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

    res.json({ message: 'הספר עודכן בהצלחה', book });
  } catch (error) {
    next(error);
  }
};


// 5. ביצוע השאלה
const borrowBook = (req, res, next) => {
  const bookCode = parseInt(req.params.code);
  const book = books.find(b => b.code === bookCode);

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
      customerCode: customerCode});}
  else{
  const error = new Error('המשתמש לא קיים במערכת');
  error.status = 404;
  error.type = 'Not Found';
  return next(error);
}
    

  res.json({ message: 'הספר הושאל בהצלחה', book });
  };



// 6. ביצוע החזרה
const returnBook = (req, res, next) => {
  const bookCode = parseInt(req.params.code);
  const book = books.find(b => b.code === bookCode);

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
  res.json({ message: 'הספר הוחזר בהצלחה', book });
};


// 7. מחיקת ספר לפי קוד
const deleteBook = (req, res, next) => {
  const bookCode = parseInt(req.params.code);
  const bookIndex = books.findIndex(b => b.code === bookCode);

  if (bookIndex === -1) {
  const error = new Error('הספר לא נמצא במערכת');
  error.status = 404;
  error.type = 'Not Found';
  return next(error);
};

  const deletedBook = books.splice(bookIndex, 1);
  res.json({ message: 'הספר נמחק בהצלחה', deletedBook });
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
