const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, logout, getProfile, getActivities } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.get('/activities', auth, getActivities);

module.exports = router;
