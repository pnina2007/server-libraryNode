
const User = require('../models/user.model');
const { userSchema } = require('../validations/user.validation');

// הצגת כל המשתמשים בלי סיסמאות
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// 2. הרשמה
const signUp = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // בדיקת תקינות באמצעות JOI
    const { error } = userSchema.validate(req.body);

    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      err.type = 'Bad Request';
      return next(err);
    }

    // בדיקה אם האימייל כבר קיים
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('האימייל כבר קיים במערכת');
      error.status = 400;
      error.type = 'Bad Request';
      return next(error);
    }

    // יצירת משתמש חדש במסד הנתונים
    const newUser = await User.create({
      name, email, phone, password });

    res.status(201).json({
      message: 'ההרשמה הצליחה',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        borrowedBooks: newUser.borrowedBooks
      }
    });

  } catch (error) {
    next(error);
  }
};

// 3. התחברות
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // בדיקה שכל השדות נשלחו
    if (!email || !password) {
      const error = new Error('יש למלא אימייל וסיסמה');
      error.status = 400;
      error.type = 'Bad Request';
      return next(error);
    }

    // חיפוש משתמש במסד הנתונים
    const user = await User.findOne({
      email: email.toLowerCase(),
      password
    });

    if (!user) {
      const error = new Error('האימייל או הסיסמה שגויים');
      error.status = 401;
      error.type = 'Unauthorized';
      return next(error);
    }

    res.json({
      message: 'ההתחברות הצליחה',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        borrowedBooks: user.borrowedBooks
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  signUp,
  signIn
};
