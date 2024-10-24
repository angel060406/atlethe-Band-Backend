require('dotenv').config();
require('./database/database').connect();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/', userRoutes);

module.exports = app;