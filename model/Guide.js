const mongoose = require('mongoose');

const schema = mongoose.Schema;

const guideSchema = new schema({

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
    image: {
        type: String,
        default: "https://images.squarespace-cdn.com/content/v1/56b589c60442626693853236/1488793006848-FVC8RW1Y61KG31K32I2U/1.jpg",
    },

    number: {
        type: Number
    },

    timestamp: {
        type: String,
        default: Date.now
    },

    fees: {
        type: Number,
        default: 100
    },
    place: {
        type: String,
        default: "Mumbai"
    }


});

const Guide = mongoose.model('Guide', guideSchema);

module.exports = Guide;