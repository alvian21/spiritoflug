const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const foodSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;

