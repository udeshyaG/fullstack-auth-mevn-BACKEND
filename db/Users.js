const mongoose = require("mongoose");

const Users = mongoose.model("Users", {
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    default: true,
  },

  roles: {
    type: String,
    default: "user",
  },
});

module.exports = Users;
