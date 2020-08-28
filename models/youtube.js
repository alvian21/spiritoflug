const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const youtubeSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    
});

const Youtube = mongoose.model("Youtube", youtubeSchema);

module.exports = Youtube;

