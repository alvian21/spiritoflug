const youtubeModel = require('../models/youtube');
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
            let missingKeys = [];
            missingKeys = missingKey({
                url: req.body.url,
                title: req.body.title
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

        function insertToDb(index, callback) {
            youtubeModel.create({
                url: req.body.url,
                title: req.body.title
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
            youtubeModel.find()
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