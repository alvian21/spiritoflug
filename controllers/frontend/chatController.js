const userModel = require('../../models/user');
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
                    res.render("chat/index", {
                        users: user
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