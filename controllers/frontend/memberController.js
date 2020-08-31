// const userModel = require('../models/user');
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
            res.render("member/index");
        }
    ])
}