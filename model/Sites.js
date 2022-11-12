const mongoose = require('mongoose');

const schema = mongoose.Schema;

const siteSchema = new schema({

    sitename: {
        type: String,
        required: true
    },
    longitute: {
        type: Number,

    },
    latitude: {
        type: Number,

    },
    city: {
        type: String,
        required: true
    },
    built: {
        type: Number
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        default: Date.now
    }

});


const Site = mongoose.model('Site', siteSchema);

module.exports = Site;