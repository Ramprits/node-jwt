const jwt = require("jsonwebtoken");

exports.verify = (req, res, next) => {
  if (req.headers) {
    const authToken = req.headers.authorization;
    if (authToken) {
      const token = authToken.split(" ")[1];
      jwt.verify(token, process.env.TOKEN, (err, user) => {
        if (err) {
          res.status(403).send("token is not valid");
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ error: "You are not authenticated" });
    }
  }
};
