
const express = require('express');
const router = express.Router();
const logGetDate = require('../middlewares/logGetDate');
const validate = require('../middlewares/validate');
const { bookSchema, updateBookSchema } =
    require('../validations/book.validation');
const upload = require('../middlewares/upload');
const validateImage = require('../middlewares/validateImage');

const {
  getAllBooks,
  getBookByCode,
  addBook,
  updateBook,
  borrowBook,
  returnBook,
  deleteBook
} = require('../controllers/book.controller');

router.get('/', logGetDate, getAllBooks);
router.get('/:code', logGetDate, getBookByCode);
router.post('/', upload.single('image'), validate(bookSchema), validateImage, addBook);
router.put('/:code', upload.single('image'), validate(updateBookSchema), validateImage, updateBook);
router.post('/:code/borrow', borrowBook);
router.patch('/:code/return', returnBook);
router.delete('/:code', deleteBook);


module.exports = router;
