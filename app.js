require('dotenv').config();
require('./database/database').connect();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Inicializar el cliente MQTT
require('./utils/mqttClient');

const userRoutes = require('./routes/userRoutes');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://34.226.61.201',
    credentials: true,
}));

app.use('/', userRoutes);
app.use('/sensor', sensorRoutes);

module.exports = app;
