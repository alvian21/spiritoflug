const userModel = require('../../models/user');
const locationModel = require('../../models/location');
const async = require("async");
const output = require("../../functions/output");
const missingKey = require("../../functions/missingKey");
const path = require("path");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const readHTMLFile = require("../../functions/readHTMLFile");

exports.login = (req, res) => {
    async.waterfall([

        function returnToIndex(callback) {
            if (req.session.token) {
                res.render("index", {
                    url: ""
                });
            } else {
                res.render("auth/login", {
                    url: "/admin/login"
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


exports.postLogin = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                username: req.body.username,
                password: req.body.password
            });

            if (missingKeys.length !== 0) {
                res.render("auth/login", {
                    message: {
                        missingKeys
                    },
                    url: "/admin/login"
                })
            }
            callback(null, true);
        },

        function login(index, callback) {
            axios.post(process.env.CLIENT_URL+"/auth/signin-admin", {
                username: req.body.username,
                password: req.body.password
            }).then(function (response) {
                if (response.data.message == "Ok.") {
                    req.session.token = response.data.data;
                    return res.redirect("/admin");
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}


exports.logout = (req, res) => {
    async.waterfall([
        function logout(callback) {
            if (req.session.token) {
                req.session.destroy(function (err) {
                    if (!err) {
                        return res.redirect("/admin/login");
                    }
                })
            }
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}