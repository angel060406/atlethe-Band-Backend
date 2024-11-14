const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, dashboard } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
//router.get('/users', getAllUsers);
router.get('/dashboard', auth, dashboard);

module.exports = router;
