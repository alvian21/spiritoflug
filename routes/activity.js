"use strict";
const express = require("express");
const activityController = require("../controllers/activityController");
const getUserByToken = require("../functions/getUserByToken");
const output = require("../functions/output");
const router = express.Router();

router.post("/",activityController.create);

module.exports = router;