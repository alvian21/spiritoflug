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
        function checkMissingKey(callback) {
            // const io = req.app.locals.io;
            // io.emit('message', req.body);
            // res.status(200);
            // io.emit("coba", { my: "Hello world" });
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
            const io = req.app.locals.io;
            io.emit('message', req.body);
            res.status(200);
            // io.emit("coba", { my: "Hello world" });
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}