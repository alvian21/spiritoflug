const emergencyModel = require('../models/emergency');
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
const jsftp = require("jsftp");
const Ftp = new jsftp({
    host: process.env.FTP_HOSTNAME,
    port: process.env.FTP_PORT,
    user: process.env.FTP_USERNAME,
    pass: process.env.FTP_PASSWORD
});
const imageToBase64 = require('image-to-base64');
const { response } = require('express');

exports.create = (req, res) => {
    async.waterfall([
        function insertToDb(callback) {
            const user = req.user;
            emergencyModel.create({ user_id: user._id }).then(res => {
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

exports.view = (req, res) => {
    async.waterfall([
        function viewData(callback) {
            let emergency = [];
            emergencyModel.aggregate([{ "$group": { _id: "$user_id", count: { $sum: 1 } } }]).then(data => {
                if (data) {
                    callback(null, data);
                }

            })

        },

        function loopData(data, callback) {
            data.forEach(element => {
                userModel.findById({ _id: element._id }).then(user => {
                   if(user){
                       callback(null, user);
                   }
                })
            });
        },
        
        function returnView(user,callback){
            console.log(user);
        }



       
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}
