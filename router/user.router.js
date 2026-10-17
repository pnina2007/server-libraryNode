
const express = require('express');
const router = express.Router();
const logGetDate = require('../middlewares/logGetDate');

const {
  getAllUsers,
  signUp,
  signIn
} = require('../controllers/user.controller');

// הצגת כל המשתמשים
router.get('/', logGetDate, getAllUsers);

// הרשמה
router.post('/signup', signUp);

// התחברות
router.post('/signin', signIn);

module.exports = router;
