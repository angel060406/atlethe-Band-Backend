const express = require('express');
const router = express.Router();
const { registerRead, getAllReadings, getTemperatureSummary, getTemperatureHistory, getTemperatureBinomial } = require('../controllers/sensorController');

router.post('/registerread', registerRead);
router.get('/readings', getAllReadings);

router.get('/temperature-summary', getTemperatureSummary);
router.get('/temperature-history', getTemperatureHistory);
router.get('/temperature-binomial', getTemperatureBinomial);

module.exports = router;
