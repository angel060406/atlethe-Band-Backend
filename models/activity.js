const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    type: { 
        type: String, required: true 
    },
    description: { 
        type: String 
    },
    date: { 
        type: Date, default: Date.now 
    },
    distance: {
        type: String, default: "0.00 KM" 
    },
    time: { 
        type: String, default: "00:00:00" 
    },
});

module.exports = mongoose.model('Activity', activitySchema);