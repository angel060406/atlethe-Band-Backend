const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
        maxlength: 100
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es obligatorio']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    token: {
        type: String,
        default: null 
    },
});

module.exports = mongoose.model("User", userSchema);
