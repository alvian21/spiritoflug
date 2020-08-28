const selfieModel = require('../models/selfie');
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
const FileType = require('file-type');
const generateFileName = require('../functions/generateFileName');
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");
const jsftp = require("jsftp");
const { response } = require('express');
const Ftp = new jsftp({
    host: process.env.FTP_HOSTNAME,
    port: process.env.FTP_PORT,
    user: process.env.FTP_USERNAME,
    pass: process.env.FTP_PASSWORD
});

exports.create = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys=[];
            missingKeys = missingKey({
                image:req.body.image
            });

            if(missingKeys.length !== 0){
                return callback({
                    code:"MISSING_KEY",
                    data:{
                        missingKeys
                    }
                })
            }
            callback(null, true);
        },

        function checkImageType(index, callback) {
            const decodeImage = Buffer.from(req.body.image, "base64");
            FileType.fromBuffer(decodeImage).then(response => {
                if (response.mime == "image/jpg" || response.mime == "image/png" || response.mime == "image/jpeg") {
                    req.body.ImageBuffer = decodeImage;
                    req.body.ext = response.ext;
                    callback(null, true);
                } else {
                    return callback({
                        code: "INVALID_REQUEST",
                        data: "Image type invalid"
                    });
                }
            })
        },

        function mvImage(index, callback) {
            const name = Date.now().toString() + "." + req.body.ext;
            Ftp.put(req.body.ImageBuffer, "/selfie/" + name, err => {
                if (!err) {
                    const filename = "https://" + process.env.CDN_URL + "/cdn/images/selfie/" + name;
                    req.body.image = filename;
                    callback(null, true);
                } else {
                    return callback({
                        code: "GENERAL_ERR",
                        data: err
                    })
                }

            })
        },

        function insert(index, callback) {
            const user = req.user;
            selfieModel.create({
                user_id: user._id,
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
},

    exports.view = (req, res) => {
        async.waterfall([
            function viewData(callback) {
                selfieModel.find()
                    .then(res => {
                        if (res) {
                            return callback({
                                code: "OK",
                                data: res
                            })
                        } else {
                            return callback({
                                code: "INVALID_REQUEST",
                                data: "NOT FOUND"
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
