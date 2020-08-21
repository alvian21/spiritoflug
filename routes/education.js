"use strict";
const express = require("express");
const educationController = require("../controllers/educationController");
const getUserByToken = require("../functions/getUserByToken");
const roleController = require("../controllers/rolesController");
const output = require("../functions/output");
const { route } = require("./activity");
const router = express.Router();

//AUTH MIDDLEWARE
router.use((req, res, next) => {
    if (!req.headers.authorization)
        return output.print(req, res, {
            code: "ERR_ACCESS",
            data: new Error("Not Authorized")
        });

    getUserByToken(req, res, req.headers.authorization, (err, user) => {
        if (err || !user)
            return output.print(req, res, {
                code: "ERR_ACCESS",
                data: new Error("Not Authorized")
            });
        else {
            req.user = user;
            next();
        }
    });
});

router.post("/", roleController.grantAccess("createOwn","education"), educationController.create);
router.get("/", roleController.grantAccess("readAny","education"), educationController.view);
router.delete("/:id", roleController.grantAccess("deleteAny","education"), educationController.delete);
module.exports = router;