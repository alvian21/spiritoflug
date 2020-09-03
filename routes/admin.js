"use strict";

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/frontend/dashboardController");
const memberController = require("../controllers/frontend/memberController");
const chatController = require("../controllers/frontend/chatController");
const loginController = require("../controllers/frontend/loginController");

router.get("/login", loginController.login);
router.post("/login", loginController.postLogin);
//AUTH SESSION
router.use((req, res, next) => {
    if (!req.session.token) {
        return res.redirect("/admin/login");
    } else {
       
        next();
    }

});

router.get("/", dashboardController.index);
router.get("/member", memberController.index);
router.get("/member/:id", memberController.detail);
router.post("/logout", loginController.logout);
router.get("/chat", chatController.index);
module.exports = router;