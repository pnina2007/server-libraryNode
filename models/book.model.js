const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: String,
    price: Number,
    categories: [String],
    author: {
        name: String, phone: String, email: String
    },
    code: Number,
    title: String,
    category: String,
    isBorrowed: { type: Boolean, default: false },
    borrowHistory: [{
        borrowDate: String,
        customerCode: Number
    }],
    image: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;