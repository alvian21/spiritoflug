"use strict";
const express = require("express");
const activityController = require("../controllers/activityController");
const getUserByToken = require("../functions/getUserByToken");
const output = require("../functions/output");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/activity/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }

});
const upload = multer({ storage: storage });

router.post("/",activityController.create);

module.exports = router;