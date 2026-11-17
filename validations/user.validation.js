const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required()
});

module.exports = { userSchema };