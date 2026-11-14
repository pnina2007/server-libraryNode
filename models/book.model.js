const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: String,
    price: Number,
    categories: [String],
    author: {
        name: String, phone: String, email: String
    },
    code: Number,
    title: { type: String, required: true, minlength: 2,
            maxlength: 20,  unique: true},
    category: {type: String,enum: ['נוער', 'מבוגרים', 'ילדים'],
    required: true},

    isBorrowed: { type: Boolean, default: false },
    borrowHistory: [{
        borrowDate: String,
        customerCode: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'}
         }],
    image: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;