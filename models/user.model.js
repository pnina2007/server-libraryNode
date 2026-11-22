const bcrypt = require('bcrypt');  //ספריית ההצפנה
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

// הצפנת הסיסמה לפני שמירת המשתמש
userSchema.pre('save', async function () {

    // יצירת Hash לסיסמה
    this.password = await bcrypt.hash(this.password, 10);
});

//יוצר מודל בשם User, שמאפשר לנו לבצע פעולות מול מסד הנתונים MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
