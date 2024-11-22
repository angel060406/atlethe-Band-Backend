const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, logout, getProfile, getActivities, registerActivity } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/activities', authMiddleware, registerActivity);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.post('/activities', registerActivity);
router.get('/activities', getActivities);
router.get('/validateToken', auth, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});


module.exports = router;
