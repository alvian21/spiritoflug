const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    indication: {
        type: String,
        required: true
    },
    resetLink:{
        data:String,
        default:""
    },
    resetTotp:{
        data:String,
        default:""
    },
    role:{
        type:String,
        default:"member"
    },
    latitude:{
        type:String,
        required:false,
        default:""
    },
    longitude:{
        type:String,
        required:false,
        default:""
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;