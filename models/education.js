const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const educationSchema = new Schema({
    title: {
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

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;

