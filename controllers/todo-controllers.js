const HttpError = require("../models/http-error");
const Todo = require("../models/todo");
const User = require("../models/user");
const mongoose = require("mongoose");

const getTodos = async (req, res, next) => {
  const userId = req.params.uid;
  // return next(new HttpError("Cant fetch todos.", 500));

  let user;

  try {
    user = await User.findById(userId).populate({
      path: "todos",
      model: "Todo",
    });
  } catch (error) {
    return next(
      new HttpError("Could not find user for provided id , try again.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  res.status(200).json(user.todos);
};

const createTodo = async (req, res, next) => {
  const { text, userId, isChecked } = req.body;
  if (!text) {
    return next(new HttpError("Please provide a todo text", 400));
  }
  const createdTodo = new Todo({
    text,
    isChecked: isChecked,
    creator: userId,
  });

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(
      new HttpError("Could not find user for provided id, try again.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTodo.save({ session: sess });
    user.todos.push(createdTodo);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Creating todo faileddd, please try again", 500));
  }

  res.status(201).json({ ok: "true" });
};

const checkTodo = async (req, res, next) => {
  const todoId = req.body.todoId;

  let todo;

  try {
    todo = await Todo.findById(todoId);
  } catch (error) {
    return next(
      new HttpError("Could not find todo for provided id, try again.", 500)
    );
  }

  if (!todo) {
    return next(new HttpError("Could not find todo for provided id", 404));
  }

  todo.isChecked = !todo.isChecked;
  try {
    await todo.save();
  } catch (error) {
    return next(new HttpError("Could not check todo ", 500));
  }
  res.status(200).json({ ok: "true" });
};

const deleteTodo = async (req, res, next) => {
  const todoId = req.body.todoId;
  let todo;
  try {
    todo = await Todo.findById(todoId).populate("creator");
  } catch (error) {
    return next(new HttpError("Could not delete todo, try again.", 500));
  }
  if (!todo) {
    return next(new HttpError("Could not find todo for this id", 404));
  }
  if (todo.creator.id !== req.body.userId) {
    return next(new HttpError("You are not allowed to delete this todo.", 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await todo.remove({ session: sess });
    todo.creator.todos.pull(todo);
    await todo.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Could not delete todo"), 500);
  }

  res.status(200).json({ ok: true });
};

exports.getTodos = getTodos;
exports.createTodo = createTodo;
exports.checkTodo = checkTodo;
exports.deleteTodo = deleteTodo;
