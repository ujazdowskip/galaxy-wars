const express = require("express");
const router = express.Router();

module.exports = (creationDate) => {
  router.get("/", function (req, res, next) {
    const d = new Date();
    res.send(
      `Hello express. Created ${creationDate.toString()}. Current ${d.toString()}`
    );
  });

  router.post("/", function (req, res, next) {
    console.log(req.body);
    res.send("HANDLED");
  });

  return router;
};
