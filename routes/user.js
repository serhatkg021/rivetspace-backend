const express = require('express');
const usersController = require('../controllers/userController');
const { tokenControl } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', usersController.userLogin);
router.post('/register', usersController.createUser);
router.get('/', tokenControl, usersController.getUsers);
router.get('/:id', tokenControl, usersController.getUserById);


module.exports = router;
