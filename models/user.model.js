
const { number } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},

    email: { type: String, required: true, unique: true,
         lowercase: true},
    phone: { type: String, required: true,
        match: /^(?:0[23489][- ]?\d{7}|05\d[- ]?\d{7})$/},

    password: {  type: String, required: true, minlength: 4},

    registrationDate: {  type: Date,default: Date.now},

    borrowedBooks: [{
        code: {  type: Number, required: true },
        name: {  type: String, required: true }}]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
