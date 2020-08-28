const foodModel = require('../models/food');
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
const jsftp = require("jsftp");
const Ftp = new jsftp({
    host: process.env.FTP_HOSTNAME,
    port: process.env.FTP_PORT,
    user: process.env.FTP_USERNAME,
    pass: process.env.FTP_PASSWORD
});
const imageToBase64 = require('image-to-base64');

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
                link: req.body.title,
                category: req.body.category,
                description: req.body.description,
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
            const name = generateFileName(req.files.image);
            Ftp.put(req.files.image.data, "/food/" + name, err => {
                if (!err) {
                    const filename = "https://" + process.env.CDN_URL + "/cdn/images/food/" + name;
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
            foodModel.create({
                title: req.body.title,
                link: req.body.title,
                category: req.body.category,
                description: req.body.description,
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

exports.view = (req, res) => {
    async.waterfall([
        function viewData(callback) {
            if(req.body.category){
                foodModel.findOne({category: req.body.category})
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
            }else{
                foodModel.find()
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
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}