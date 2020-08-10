const userModel = require("../models/user");
const output = require("../functions/output");

module.exports = (req, res, token, callback) => {
    userModel.findOne({ token: token }).then(user => {
        if (user) {
            callback(null, user);
        } else {
            callback(null, null);
        }
    }).catch(err => {
        return output.print(req, res, {
            code: "ERR_DATABASE",
            data: err
        });
    });
}