const mongoose = require('mongoose');

const db = async () => {
    try {
        const success = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connection success');
    } catch (error) {
        console.log('MongoDB connection failed');
        throw new Error(error);
    }
}

module.exports = db;