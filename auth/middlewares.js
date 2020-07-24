const jwt = require("jsonwebtoken");

async function checkTokenSetUser(req, res, next) {
  const authHeader = req.get("authorization");

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (token) {
      try {
        const user = await jwt.verify(token, process.env.TOKEN_SECRET);

        req.user = user;
        next();
      } catch (error) {
        console.log(error);
      }
    }
  } else {
    next();
  }
}

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    const error = new Error("Unauthorised 🛑🛑🚫");
    res.status(401);
    next(error);
  }
}

function isAdmin(req, res, next) {
  if (req.user.roles === "admin") {
    next();
  } else {
    const error = new Error("Unauthrorized 🛑🛑🚫");
    res.status(401);
    next(error);
  }
}

module.exports = {
  checkTokenSetUser,
  isLoggedIn,
  isAdmin,
};
