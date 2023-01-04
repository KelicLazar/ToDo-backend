const express = require("express");
const todoController = require("../controllers/todo-controllers");
const router = express.Router();

router.get("/get/:uid", todoController.getTodos);

router.post("/create", todoController.createTodo);

router.patch("/check", todoController.checkTodo);

router.delete("/delete", todoController.deleteTodo);

module.exports = router;
