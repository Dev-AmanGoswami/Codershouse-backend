const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    activated: {
        type: Boolean,
        required: false,
        default: false
    }
},{
    timestamps: true
});

module.exports = mongoose.model('User',userSchema,'users');