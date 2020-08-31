"use strict";

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/frontend/dashboardController");
const memberController = require("../controllers/frontend/memberController");

router.get("/", dashboardController.index);
router.get("/member", memberController.index);
module.exports = router;