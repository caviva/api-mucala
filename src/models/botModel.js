const { Schema, model } = require('mongoose');

const botSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    url: {
        type: String,
        required: true,
    },
    pm2: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    finishedAt: {
        type: Date,
    },
    icon: {
        type: String,
        default: 'https://i.imgur.com/5lT1Z7J.png',
    },
    plan: {
        type: String,
        default: 'Starter',
    },
    price: {
        type: Number,
        default: 0,
    },
});

module.exports = model('Bot', botSchema, 'bots');