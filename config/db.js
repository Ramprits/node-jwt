const mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(
    "mongodb://localhost:27017/jwtAppDB",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (!err) {
        console.log("MongoDB Connection Succeeded.");
      } else {
        console.log("Error in DB connection: " + err);
      }
    }
  );
};
