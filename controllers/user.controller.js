
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
const signUp = (req, res) => {
  const { username, email, password } = req.body;

  // בדיקה שכל השדות הנדרשים נשלחו
if (!username || !email || !password) {
  return res.status(400).json({
    message: 'יש למלא שם משתמש, אימייל וסיסמה'
  });
}
// בדיקה אם האימייל כבר קיים
const existingEmail = users.find(
  user => user.email === email
);

if (existingEmail) {
  return res.status(400).json({
    message: 'האימייל כבר קיים במערכת'
  });
}

  // בדיקה אם הסיסמא כבר קיימת 
  const existingUser = users.find(user => user.password === password);

  if (existingUser) {
    return res.status(400).json({
      message: 'הסיסמא כבר קיימת במערכת'
    });
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
const signIn = (req, res) => {
  const { email, password } = req.body;

  // בדיקה שכל השדות נשלחו
  if (!email || !password) {
    return res.status(400).json({
      message: 'יש למלא אימייל וסיסמה'
    });
  }

  // חיפוש משתמש לפי אימייל וסיסמה
  const user = users.find(
    user => user.email === email &&
            user.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: 'האימייל או הסיסמה שגויים'
    });
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
