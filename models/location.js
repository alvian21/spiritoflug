const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const locationSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: false,
    },
    longitude: {
        type: String,
        required: false
    }
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;

