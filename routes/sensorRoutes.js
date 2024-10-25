const express = require('express');
const router = express.Router();
const { registerRead, getAllReadings} = require('../controllers/sensorController')

router.post('/registerread', registerRead);
router.get('/readings', getAllReadings);

module.exports = router;