const userModel = require('../models/user');
const async = require("async");
const output = require("../functions/output");
const missingKey = require("../functions/missingKey");

exports.detail = (req, res) => {
    async.waterfall([
        function checkUser(callback) {
            userModel.findOne({
                username: req.user.username
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