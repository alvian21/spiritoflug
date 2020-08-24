const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    admin_id:{
        type: String,
        required: true
    }
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;

