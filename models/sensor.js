const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    sensorType: {
        type: String,
        default: null
    },
    value: {
        type: Number,
        default: null
    },
});

module.exports = mongoose.model("Sensor", sensorSchema);