var express = require("express");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var { verify } = require("../middleware/verify");
var router = express.Router();
var User = require("../models/user");
let refreshTokens = [];

router.post("/register", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const user = new User({ ...req.body, password: hash });
  await user.save();
  user.password = undefined;
  res.status(201).json(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(403).json({ error: "user email or password incorrect" });
  const passwordMatch = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordMatch)
    return res.status(403).json({ error: "user email or password incorrect" });
  user.password = undefined;

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  res.status(200).json({ user, token, refreshToken });
});

const generateToken = (user) => {
  return jwt.sign({ user }, process.env.TOKEN, {
    expiresIn: "20m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ user }, process.env.REFRESH_TOKEN);
};

router.post("/refreshToken", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken)
    return res.status(403).json({ error: "You are not authenticated" });

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: "Refresh token is not valid" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    err && console.error(err.message);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateRefreshToken(user);
    const newRefreshAccessToken = generateRefreshToken(user);

    res.status(200).json({
      user,
      token: newAccessToken,
      refreshToken: newRefreshAccessToken,
    });
  });
});

router.post("/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json({ message: "You are successfully logged out." });
});

module.exports = router;
