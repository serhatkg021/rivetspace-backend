const express = require('express');
const userAuthController = require('../controllers/userAuthController');
const { tokenControl } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', userAuthController.userLogin);
router.post('/register', userAuthController.createUser);
router.get('/verify-mail/:token', userAuthController.verifyMail);

router.get('/', tokenControl, userAuthController.getUsers);
router.get('/:id', tokenControl, userAuthController.getUserById);


module.exports = router;
