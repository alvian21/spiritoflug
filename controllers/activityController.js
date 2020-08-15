const activityModel = require('../models/activity');
const async = require("async");
const output = require("../functions/output");
const missingKey = require("../functions/missingKey");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/activity/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString + file.originalname);
    }

});
const upload = multer({ storage: storage });
const crypto = require("crypto");
const Speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const generateFileName = require('../functions/generateFileName');
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.create = (req, res) => {
    async.waterfall([
        function checkImage(callback) {
            if (!(req.files && req.files.image)) {
                return callback({
                    code: "INVALID_REQUEST",
                    data: "Image file required"
                });
            } else {
                callback(null, true);
            }
        },

        function checkMissingKey(index, callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                title: req.body.title,
                sumber: req.body.sumber,
                link: req.body.link
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

        function mvImage(index, callback) {
            if (!checkImageExt(req.files.image)) {
                return callback({
                    code: "INVALID_REQUEST",
                    data: "Image type invalid"
                });
            }

            const filename = "./uploads/activity/" + generateFileName(req.files.image);

            moveFile(req.files.image, filename, err => {
                if (err) {
                    return callback({
                        code: "GENERAL_ERR",
                        data: err
                    })
                } else {
                    req.body.image = filename;
                    callback(null, true);
                   
                }
            });
        },

        function insert(index, callback) {
            activityModel.create({
                title: req.body.title,
                sumber: req.body.sumber,
                link: req.body.link,
                image: req.body.image
            }).then(res => {
                if (res) {
                    return callback({
                        code: "OK",
                        data: res
                    })
                }
            }).catch(err => {
                return callback({
                    code: "ERR_DATABASE",
                    data: err
                });
            });
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}