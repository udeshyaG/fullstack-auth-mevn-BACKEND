const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Notes = require("../db/Notes");

const schema = Joi.object().keys({
  title: Joi.string().trim().required(),
  note: Joi.string().trim().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const notesList = await Notes.find({ user_id: req.user._id });
    res.json(notesList);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const result = schema.validate(req.body);

  if (result.error) {
    const error = new Error(result.error);
    res.status(422);
    next(error);
  } else {
    //insert into database
    const newNote = new Notes({
      ...req.body,
      user_id: req.user._id,
    });

    const resultDB = await newNote.save();

    res.json(resultDB);
  }
});

module.exports = router;
