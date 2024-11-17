require('dotenv').config();
require('./database/database').connect();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Inicializar el cliente MQTT
// Queda comentado para centrarse en las pruebas de userController
//require('./utils/mqttClient');

const userRoutes = require('./routes/userRoutes');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/', userRoutes);
app.use('/sensor', sensorRoutes);

module.exports = app;
