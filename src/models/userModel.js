const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'default.png',
    },
    role: {
        type: String,
        default: 'user',
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('User', userSchema, 'users');