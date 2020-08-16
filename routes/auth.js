"use strict";

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/signin-admin", authController.signInAdmin);
router.put("/forgot-password", authController.forgotPassword);
router.put("/reset-password", authController.resetPassword);
module.exports = router;