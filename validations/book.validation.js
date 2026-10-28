
const Joi = require('joi');

const bookSchema = Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),
    category: Joi.string().trim().min(2).required(),
    price: Joi.number().min(0).required()
});
//סכמה שלישית
const updateBookSchema = Joi.object({
    title: Joi.string().trim().min(2).max(100),
    category: Joi.string().trim().min(2),
    price: Joi.number().min(0)
}).min(1);

module.exports = {
    bookSchema,
    updateBookSchema
};
