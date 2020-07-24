const mongoose = require("mongoose");

const Notes = mongoose.model("Notes", {
  title: {
    type: String,
    required: true,
  },

  note: {
    type: String,
    required: true,
  },

  user_id: {
    type: String,
    required: true,
  },
});

module.exports = Notes;
