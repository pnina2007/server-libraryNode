
const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required()
});

module.exports = { userSchema };
