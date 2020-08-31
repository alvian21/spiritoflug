"use strict";

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/frontend/dashboardController");
const memberController = require("../controllers/frontend/memberController");
const chatController = require("../controllers/frontend/chatController");

router.get("/", dashboardController.index);
router.get("/member", memberController.index);
router.get("/chat", chatController.index);
module.exports = router;