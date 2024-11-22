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
<<<<<<< Updated upstream
    //origin: 'http://localhost:5173',
    origin: 'http://34.226.61.201',
=======
    origin: 'https://athlete-band.integrador.xyz',
>>>>>>> Stashed changes
    credentials: true,
}));

app.use('/', userRoutes);
app.use('/sensor', sensorRoutes);

module.exports = app;
