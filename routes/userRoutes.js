const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, dashboard } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
//router.post('/logout', logout);
router.get('/dashboard', auth, dashboard);
//router.get('/profile', auth, profile);
//router.get('/activities', auth, activities);

module.exports = router;
