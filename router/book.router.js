
const express = require('express');
const router = express.Router();
const logGetDate = require('../middlewares/logGetDate');

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
router.post('/', addBook);
router.put('/:code', updateBook);
router.post('/:code/borrow', borrowBook);
router.patch('/:code/return', returnBook);
router.delete('/:code', deleteBook);

module.exports = router;
