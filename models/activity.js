const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activityScehma = new Schema({
    title: {
        type: String,
        required: true
    },
    sumber: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required:true
    }
});

const Activity = mongoose.model("Activity", activityScehma);

module.exports = Activity;

