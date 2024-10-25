const express = require('express');
const router = express.Router();
const { registerRead, getAllReadings} = require('../controllers/sensorController')

router.post('/registerread', registerRead);
router.get('/reads', getAllReadings);

module.exports = router;