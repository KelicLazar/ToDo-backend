//
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user-routes");
const todoRoutes = require("./routes/todo-routes");
const app = express();
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use("/api/users", userRoutes);

app.use("/api/todos", todoRoutes);

app.use("*", (req, res, next) => {
  return next(
    new HttpError(
      "Something went wrong, check your request and try again.",
      400
    )
  );
});

app.use((error, req, res, next) => {
  res
    .status(typeof error.code === "number" ? error.code : 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .set("strictQuery", true)
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-react.j3wql.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => console.log(err));
