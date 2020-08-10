"use strict";
const express = require("express");
const userController = require("../controllers/userController");
const getUserByToken = require("../functions/getUserByToken");
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

router.get("/profile", userController.detail);

module.exports = router;