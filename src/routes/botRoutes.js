const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const check = require('../middlewares/auth');

router.get('/', check.auth, botController.index);

router.post('/register', check.auth, botController.register);

router.get('/status/:botId', check.auth, botController.status);

router.get('/stop/:botId', check.auth, botController.stop);

router.get('/start/:botId', check.auth, botController.start);

router.get('/qr/:botId', check.auth, botController.qr);

router.get('/list', check.auth, botController.list);

module.exports = router;