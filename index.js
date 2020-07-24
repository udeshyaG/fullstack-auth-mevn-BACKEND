const express = require("express");
const morgan = require("morgan");
const auth = require("./auth/index");
const notes = require("./api/notes");
const users = require("./api/users");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const middlewares = require("./auth/middlewares");

const app = express();
app.use(morgan("dev"));

app.use(helmet());

//parse the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Set up cors
app.use(
  cors({
    origin: "http://localhost:8080",
  })
);

//Mongo DB connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = 3000;

app.use(middlewares.checkTokenSetUser);

app.get("/", (req, res) => {
  res.json({
    message: "Hello World ",
    user: req.user,
  });
});

//Router for auth
app.use("/auth", auth);

//Router for notes
app.use("/api/v1/notes", middlewares.isLoggedIn, notes);

//Routes for users
app.use("/api/v1/users", middlewares.isLoggedIn, middlewares.isAdmin, users);

//not found
app.use((req, res, next) => {
  res.status(404);
  const error = new Error("Not Found - " + req.originalUrl);
  next(error);
});

//error handler
app.use((err, req, res, next) => {
  res.status(res.statusCode || 500);

  res.json({
    message: err.message,
    stack: err.stack,
  });
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
