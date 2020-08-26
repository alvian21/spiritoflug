const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversation_id: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

