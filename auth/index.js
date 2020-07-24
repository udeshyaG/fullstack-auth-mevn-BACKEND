const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//THe Users model
const Users = require("../db/Users");

const schema = Joi.object({
  username: Joi.string().alphanum().min(2).max(30).required(),

  password: Joi.string().trim().min(8).required(),

  roles: Joi.string().trim(),
});

router.get("/", (req, res) => {
  res.json({
    message: "Inside Auth router",
  });
});

router.post("/signup", async (req, res, next) => {
  const result = schema.validate(req.body);

  if (result.error === null || result.error === undefined) {
    const user = await Users.findOne({ username: req.body.username });

    if (user) {
      //user already exists
      res.status(409);
      const error = new Error("Username is taken");

      next(error);
    } else {
      //hash the password
      const hashedPass = await bcrypt.hash(req.body.password, 8);

      //insert the user to database
      const newUser = new Users({
        username: req.body.username,
        password: hashedPass,
        roles: req.body.roles,
      });

      const createdUser = await newUser.save();

      //res.json(createdUser);

      //Create payload for jwt
      const payload = {
        _id: createdUser._id,
        username: createdUser.username,
        roles: createdUser.roles,
      };

      //Now respond with the jwt
      try {
        const token = await jwt.sign(payload, process.env.TOKEN_SECRET, {
          expiresIn: "1d",
        });

        res.json({ token });
      } catch (error) {
        respondError422(res, next);
      }
    }
  } else {
    next(result.error);
  }
});

function respondError422(res, next) {
  res.status(422);
  const error = new Error("Unable to Login");
  next(error);
}

router.post("/login", async (req, res, next) => {
  const result = schema.validate(req.body);

  if (result.error) {
    respondError422(res, next);
  } else {
    const user = await Users.findOne({
      username: req.body.username,
    });

    //found the user
    if (user && user.active) {
      //compare password
      const resultB = await bcrypt.compare(req.body.password, user.password);

      //if password was matched
      if (resultB) {
        const payload = {
          _id: user._id,
          username: user.username,
          roles: user.roles,
          active: user.active,
        };

        try {
          const token = await jwt.sign(payload, process.env.TOKEN_SECRET, {
            expiresIn: "1d",
          });

          res.json({ token });
        } catch (error) {
          respondError422(res, next);
        }
      }
      //the password did not match
      else {
        respondError422(res, next);
      }
    }
    //did not find the user
    else {
      respondError422(res, next);
    }
  }
});

module.exports = router;
