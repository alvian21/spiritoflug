const userModel = require('../models/user');
const async = require("async");
const output = require("../functions/output");
const missingKey = require("../functions/missingKey");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


exports.signUp = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                email: req.body.email,
                username: req.body.username,
                fullname: req.body.fullname,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                gender: req.body.gender,
                age: req.body.age,
                indication: req.body.indication
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

        function validation(index, callback) {
            // Validation password
            const passwordRegx = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
            const password = req.body.password;

            if (!password.match(passwordRegx)) {
                return callback({
                    code: "INVALID_REQUEST",
                    data:
                        "Password invalid, must be containing lowercase, uppercase, number, and 8 char"
                });
            }

            // Email validation
            const emailRegx = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            const email = req.body.email;

            if (!email.match(emailRegx)) {
                return callback({
                    code: "INVALID_REQUEST",
                    data: "Email invalid"
                });
            }

            callback(null, true);
        },
        function checkUsername(index, callback) {
            userModel.findOne({
                username: req.body.username
            }).then(res => {
                if (res) {
                    return callback({
                        code: "FOUND",
                        data: "username already taken"
                    });
                }
                callback(null, true);
            })
        },
        function checkEmail(index, callback) {
            userModel.findOne({
                email: req.body.email
            }).then(res => {
                if (res) {
                    return callback({
                        code: "FOUND",
                        data: "email already taken"
                    });
                }
                callback(null, true);
            })
        },
        function hashPassword(index, callback) {
            try {
                var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
                var mystr = mykey.update(req.body.password, "utf8", "hex");
                mystr += mykey.final("hex");
                req.body.password = mystr;
                callback(null, true);
            } catch (err) {
                return callback({
                    code: "GENERAL_ERR",
                    data: err
                });
            }
        },

        function insert(index, callback) {
            userModel.create({
                email: req.body.email,
                username: req.body.username,
                fullname: req.body.fullname,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                gender: req.body.gender,
                age: req.body.age,
                indication: req.body.indication,
                token: "not set token"
            }).then(res => {
                if (res) {
                    return callback(null, {
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
    }
    )
};

exports.signIn = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                username: req.body.username,
                password: req.body.password
            });

            if (missingKeys.length !== 0) {
                return callback({
                    code: "MISSING_KEY",
                    data: {
                        missingKeys
                    }
                });
            }

            callback(null, true);
        },

        function checkUser(index, callback) {
            userModel
                .findOne({
                    username: req.body.username
                })
                .then(res => {
                    if (!res) {
                        return callback({
                            code: "NOT_FOUND",
                            data: "Username invalid"
                        });
                    }

                    callback(null, res);
                })
                .catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    });
                });
        },

        function checkPassword(user, callback) {
            var mykey = crypto.createDecipher("aes-128-cbc", "mypassword");
            var mystr = mykey.update(user.password, "hex", "utf8");
            mystr += mykey.final("utf8");

            if (mystr !== req.body.password) {
                return callback({
                    code: "INVALID_REQUEST",
                    data: "Password wrong"
                });
            }
            callback(null, user);
        },

        function generateToken(user, callback) {
            jwt.sign(
                { user: user.email, password: user.password },
                "secret",
                {
                    algorithm: "HS256"
                },
                (err, token) => {
                    if (err) {
                        return callback({
                            code: "GENRAL_ERR",
                            data: err
                        });
                    }

                    callback(null, token);
                }
            );
        },


        function insertTokenToDb(token, callback) {
            userModel.findOneAndUpdate({ username: req.body.username },
                { $set: { token: token } }, { new: true }, (err, doc) => {
                    if (!err) {
                        return callback({
                            code: "OK",
                            data: token
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