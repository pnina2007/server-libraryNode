
const express = require('express');
const router = express.Router();
const logGetDate = require('../middlewares/logGetDate');
const validate = require('../middlewares/validate');
const { userSchema } = require('../validations/user.validation');

const {
  getAllUsers,
  signUp,
  signIn
} = require('../controllers/user.controller');

// הצגת כל המשתמשים
router.get('/', logGetDate, getAllUsers);

// הרשמה
router.post('/signup', validate(userSchema), signUp);

// התחברות
router.post('/signin', signIn);

module.exports = router;
