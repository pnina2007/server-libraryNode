
const books = [
  {
    code: 1,
    title: 'מבוא למדעי המחשב',
    category: 'לימודים',
    price: 120,
    isBorrowed: false,
    borrowHistory: []
  },
  {
    code: 2,
    title: 'תכנות ב-Node.js',
    category: 'תכנות',
    price: 150,
    isBorrowed: true,
    borrowHistory: [
      { borrowDate: '2026-02-01', customerCode: 2 }
    ]
  }
];

module.exports = { books };