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
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

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

        function getAdminId(index, callback) {
            userModel.findOne({ role: "admin" })
                .then(res => {
                    if (res) {
                        req.body.admin_id = res._id;
                        callback(null, true);
                       
                        
                    }
                })
        },

        function insertConversationId(index, callback) {
            const user = req.user;
            conversationModel.create({
                user_id: user._id,
                admin_id: req.body.admin_id
            }).then(res => {
                if (res) {
                    req.body.conversation_id = res._id;
                    callback(null, true);
               
                }
            })
        },

        function insertMessage(index, callback) {
            messageModel.create({
                conversation_id: req.body.conversation_id,
                message: req.body.message
            }).then(res => {
                if (res) {
                    io.emit("message", req.body);
                    return callback({
                        code:"OK"
                    });
                 
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