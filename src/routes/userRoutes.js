const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/userController');
const check = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/avatar');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './src/uploads/avatar');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    })
});

router.get('/', check.auth, userController.index);

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/profile', check.auth, userController.profile);

router.put('/update', check.auth, userController.update);

router.post('/upload-avatar', [check.auth, upload.single("avatar")], userController.uploadAvatar);

router.get('/avatar', check.auth, userController.sendAvatar);


module.exports = router;
