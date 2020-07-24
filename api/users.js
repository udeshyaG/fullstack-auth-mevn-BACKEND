const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Users = require("../db/Users");
const Joi = require("joi");
const { update } = require("../db/Users");

const schema = Joi.object({
  username: Joi.string().alphanum().min(2).max(30),

  password: Joi.string().trim().min(8),

  roles: Joi.array().valid("user", "admin"),

  active: Joi.bool(),
});

router.get("/", async (req, res, next) => {
  try {
    const usersList = await Users.find({}, "_id username active roles");
    res.json(usersList);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  //find the user with the given id
  const id = req.params.id;

  try {
    const result = schema.validate(req.body);

    //if there was validation error
    if (result.error) {
      res.status(422);
      throw new Error(result.error);
    }
    //No validation error
    else {
      let user = await Users.findById(id);

      if (user) {
        if (req.body.password) {
          req.body.password = await bcrypt.hash(req.body.password, 12);
        }

        try {
          const updatedUser = await Users.findByIdAndUpdate(id, req.body);

          res.json(updatedUser);
        } catch (error) {
          next(error);
        }
      } else {
        next();
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
