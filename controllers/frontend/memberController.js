const userModel = require('../../models/user');
const locationModel = require('../../models/location');
const selfieModel = require('../../models/selfie');
const async = require("async");
const output = require("../../functions/output");
const missingKey = require("../../functions/missingKey");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const readHTMLFile = require("../../functions/readHTMLFile");

exports.index = (req, res) => {
    async.waterfall([
        function returnToIndex(callback) {
            userModel.find({ role: { $ne: "admin" } }).then(user => {
                if (user) {
                    res.render("member/index", {
                        users: user,
                        url: ""
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

exports.detail = (req, res) => {
    async.waterfall([
        function returnToIndex(callback) {
            userModel.findOne({ role: { $ne: "admin" }, _id: req.params.id }, function (err, user) {
                locationModel.findOne({ user_id: req.params.id }).sort({ time: -1 }).then(latlocation => {
                    if (latlocation == null) {
                        latlocation = [];
                    }
                    res.render("member/detail", {
                        user: user,
                        location: latlocation,
                        url: ""
                    });
                })


                // console.log(user._id.toString());
            })

        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}

exports.selfie = (req, res) => {
    async.waterfall([
        function returnToIndex(callback) {
            userModel.findOne({ role: { $ne: "admin" }, _id: req.params.id }, function (err, user) {
                selfieModel.find({ user_id: req.params.id }).sort({ time: -1 }).then(selfie => {

                    res.render("member/selfie", {
                        user: user,
                        selfie: selfie,
                        url: ""
                    });
                    console.log(selfie);
                })



            })

        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}
