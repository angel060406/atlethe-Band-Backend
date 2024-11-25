const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    sensorType: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Sensor", sensorSchema);
