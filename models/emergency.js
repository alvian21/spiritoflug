const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emergencySchema = new Schema({
    user_id: {
        type: String,
        required: true
    }
});

const Emergency = mongoose.model("Emergency", emergencySchema);

module.exports = Emergency;

