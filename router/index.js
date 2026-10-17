
const express = require('express');
const router = express.Router();

const userRouter = require('./user.router');
const bookRouter = require('./book.router');

router.use('/users', userRouter);
router.use('/books', bookRouter);

module.exports = router;
