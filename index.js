const express = require('express');
const cors = require('cors');
const db = require('./config/database');
require('dotenv').config();
const userRoutes = require('./src/routes/userRoutes');
const botRoutes = require('./src/routes/botRoutes');

db();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ "message": 'API de Mucala' });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/bot', botRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});