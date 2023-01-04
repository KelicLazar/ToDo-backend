const express = require("express");
const userController = require("../controllers/users-controllers");
const router = express.Router();

router.post("/sign-up", userController.signUp);

router.post("/log-in", userController.logIn);

module.exports = router;
