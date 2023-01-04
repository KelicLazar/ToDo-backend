const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again used email", 500)
    );
  }

  if (existingUser) {
    return next(new HttpError("Email already in use, try different one", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Could not create use, please try again.", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    todos: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("Could not sign up, try again.", 500));
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Signing up failed", 500));
  }

  let userData = {
    id: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    todos: createdUser.todos,
  };

  res.status(201).json({
    userData,
    token,
  });
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Logging in failed, please try again", 500));
  }

  if (!existingUser) {
    return next(new HttpError("Invalid credentials, please try again.", 403));
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError("Could not log you in, check your credentials.", 500)
    );
  }
  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials, please try again.", 403));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Logging in failed", 500));
  }

  let userData = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    todos: existingUser.todos,
  };
  res.json({ userData, token });
};

exports.signUp = signUp;
exports.logIn = logIn;
