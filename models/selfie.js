const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const selfieSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Selfie = mongoose.model("Selfie", selfieSchema);

module.exports = Selfie;

