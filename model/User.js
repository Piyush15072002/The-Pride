const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = new schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,

    },
    emailToken: {
        type: String,

    },

    number: {
        type: Number
    },

    timestamp: {
        type: String,
        default: Date.now
    },


});

const User = mongoose.model('User', userSchema);

module.exports = User;