
const users = require('../usersDB');

// הצגת כל המשתמשים בלי סיסמאות
const getAllUsers = (req, res) => {
  const safeUsers = users.map(user => ({
    code: user.code,
    username: user.username,
    email: user.email,
    borrowedBooks: user.borrowedBooks
  }));

  res.json(safeUsers);
};


// 2. הרשמה
const signUp = (req, res, next) => {
  const { username, email, password } = req.body;

  // בדיקה שכל השדות הנדרשים נשלחו
  if (!username || !email || !password) {
    const error = new Error('יש למלא שם משתמש, אימייל וסיסמה');
    error.status = 400;
    error.type = 'Bad Request';
    return next(error);
  }

  // בדיקה אם האימייל כבר קיים
  const existingEmail = users.find(
    user => user.email === email
  );

  if (existingEmail) {
    const error = new Error('האימייל כבר קיים במערכת');
    error.status = 400;
    error.type = 'Bad Request';
    return next(error);
  }


  // בדיקה אם הסיסמא כבר קיימת 
  const existingUser = users.find(user => user.password === password);

      if (existingUser) {
    const error = new Error('הסיסמה כבר קיימת במערכת');
    error.status = 400;
    error.type = 'Bad Request';
    return next(error);
  }

  

  // יצירת משתמש חדש
  const newUser = {
    code: users.length > 0
      ? Math.max(...users.map(user => user.code)) + 1
      : 1,
    username,
    email,
    password,
    borrowedBooks: []
  };

  users.push(newUser);

  res.status(201).json({
    message: 'ההרשמה הצליחה',
    user: {
      code: newUser.code,
      username: newUser.username,
      email: newUser.email,
      borrowedBooks: newUser.borrowedBooks
    }
  });
};

// 3. התחברות
const signIn = (req, res, next) => {
  const { email, password } = req.body;

  // בדיקה שכל השדות נשלחו
  if (!email || !password) {
  const error = new Error('יש למלא אימייל וסיסמה');
  error.status = 400;
  error.type = 'Bad Request';
  return next(error);
}
  

  // חיפוש משתמש לפי אימייל וסיסמה
  const user = users.find(
    user => user.email === email &&
            user.password === password
  );

  if (!user) {
  const error = new Error('האימייל או הסיסמה שגויים');
  error.status = 401;
  error.type = 'Unauthorized';
  return next(error);
}

  res.json({
    message: 'ההתחברות הצליחה',
    user: {
      code: user.code,
      username: user.username,
      email: user.email,
      borrowedBooks: user.borrowedBooks
    }
  });
};

module.exports = {
  getAllUsers,
  signUp,
  signIn
};
