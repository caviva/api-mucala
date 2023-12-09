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
    containerId: {
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
});

module.exports = model('Bot', botSchema, 'bots');