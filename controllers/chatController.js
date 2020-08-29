const conversationModel = require('../models/conversation');
const messageModel = require('../models/message');
const userModel = require('../models/user');
const async = require("async");
const output = require("../functions/output");
const missingKey = require("../functions/missingKey");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const generateFileName = require('../functions/generateFileName');
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.view = (req, res) => {
    async.waterfall([
        // function getConversationId(callback) {
        //     const user = req.user;
        //     conversationModel.findOne({ user_id: user._id })
        //         .then(conversation => {
        //             if (conversation) {
        //                 req.body.conversation_id = conversation._id;
        //                 callback(null, true);
        //             }
        //         })
        // },

        function getMessage(callback) {
            const user = req.user;
            messageModel.find({ from_user_id: user.id })
                .then(res => {
                    if (res) {
                        return callback({
                            code: "OK",
                            data: res
                        })
                    }
                })
        }

    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}



exports.create = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                message: req.body.message
            });

            if (missingKeys.length !== 0) {
                return callback({
                    code: "MISSING_KEY",
                    data: {
                        missingKeys
                    }
                })
            }
            callback(null, true);
        },

        // function checkIfHasConversation(index, callback) {
        //     const user = req.user;
        //     conversationModel.findOne({ user_id: user._id })
        //         .then(res => {
        //                 if(res){
        //                    req.body.user_id = user._id; 
        //                 }
        //                 callback(null, true);
        //         })
        // },

        function getUserAdmin(index, callback) {
            userModel.findOne({ role: "admin" })
                .then(admin => {
                    if (admin) {
                        req.body.admin_id = admin._id;
                        callback(null, true);
                    }
                })
        },

        // function insertToConversationModel(index, callback) {
        //     const user = req.user;
        //     if(!req.body.user_id){
        //         conversationModel.create({
        //             user_id: user._id,
        //             admin_id: req.body.admin_id
        //         }).then(conversation => {
        //             if (conversation) {
        //                 req.body.conversation_id = conversation._id;
        //                 callback(null, true);
        //             }
        //         })
        //     }else{
        //         conversationModel.findOne({ user_id: user._id })
        //         .then(conversation => {
        //             if (conversation) {
        //                 req.body.conversation_id = conversation._id;
        //                 callback(null, true);
        //             }
        //         })
        //     }
           
        // },

        function insertToMessageModel(index, callback) {
            const io = req.app.locals.io;
            const user = req.user;
            messageModel.create({
                from_user_id: user.id,
                to_user_id: req.body.admin_id,
                message: req.body.message,
            }).then(res => {
                if (res) {
                    io.emit('message', req.body);
                    return callback(null, {
                        code: "OK",
                        data: res
                    })
                }
            })
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}