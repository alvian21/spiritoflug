"use strict";
const express = require("express");
const activityController = require("../controllers/activityController");
const getUserByToken = require("../functions/getUserByToken");
const roleController = require("../controllers/rolesController");
const output = require("../functions/output");
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

router.post("/", roleController.grantAccess("createOwn", "activity"), activityController.create);
router.delete("/:id", roleController.grantAccess("deleteAny", "activity"), activityController.delete);
router.get("/", roleController.grantAccess("readAny", "activity"), activityController.view);

module.exports = router;