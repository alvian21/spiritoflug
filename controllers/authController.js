const userModel = require('../models/user');
const async = require("async");
const output = require("../functions/output");
const missingKey = require("../functions/missingKey");
const jwt = require("jsonwebtoken");
const mailgun = require("mailgun-js");
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });
const crypto = require("crypto");
const Speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");


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
};

exports.forgotPassword = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                email: req.body.email
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

        function checkUser(index, callback) {
            userModel.findOne({ email: req.body.email })
                .then(user => {
                    if (!user) {
                        return callback({
                            code: "INVALID_REQUEST",
                            data: "Email not found"
                        })
                    }

                    callback(null, user);
                })
        },

        function generateSecret(user, callback) {
            const secret = Speakeasy.generateSecret({ length: 20 });
            callback(null, secret, user);
        },

        function generateTotp(secret, user, callback) {
            var token = Speakeasy.totp({
                secret: secret.base32,
                encoding: "base32",
                // leave time field 
                step: 600,
                window: 0
            });
            callback(null, user, secret, token);
        },

        function insertSecretTotp(user, secret, token, callback) {
            userModel.findOneAndUpdate({ email: user.email }, { $set: { resetTotp: secret.base32 } })
                .then(res => {
                    if (res) {
                        callback(null, token, user);
                    }
                })
        },

        function sendTokenToEmail(token, user, callback) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });


            var mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'OTP Reset Password',
                html: `<p>Please insert this otp ${token}, this OTP will expire in 10 minutes</p>`
            }

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return callback({
                        code: "INVALID_REQUEST",
                        data: error
                    })
                } else {
                    return callback({
                        code: "OK",
                        data: "Otp has been sent to email"
                    })
                }
            });
        }


    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
},

    exports.resetPassword = (req, res) => {
        async.waterfall([
            function checkMissingKey(callback) {
                let missingKeys = [];
                missingKeys = missingKey({
                    email: req.body.email,
                    token: req.body.token,
                    password: req.body.password
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

            function checkUser(index, callback) {
                userModel.findOne({ email: req.body.email })
                    .then(user => {
                        if (user) {
                            callback(null, user);
                        } else {
                            return callback({
                                code: "INVALID_REQUEST",
                                data: "Email not found"
                            })
                        }
                    })
            },

            function checkTotpToken(user, callback) {
                userModel.findOne({ email: user.email })
                    .then(res => {
                        if (res) {
                            var token = user.resetTotp.toString();
                            var verifyToken = Speakeasy.totp.verify({
                                secret: token,
                                encoding: "base32",
                                token: req.body.token,
                                step: 600,
                                window: 0
                            });
                            if (verifyToken) {
                                callback(null, true);
                            } else {
                                return callback({
                                    code: "INVALID_REQUEST",
                                    data: "Otp is invalid"
                                })
                            }

                        }
                    })
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

                callback(null, true);
            },

            function updatePassword(index, callback) {
                userModel.findOneAndUpdate({ email: req.body.email }, { $set: { password: req.body.password, resetTotp: "" } })
                    .then(res => {
                        if (res) {
                            return callback({
                                code: "OK",
                                data: "Password has been changed"
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