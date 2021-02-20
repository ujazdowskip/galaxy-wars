const express = require("express");
const router = express.Router();

module.exports = (creationDate) => {
  router.get("/", function (req, res, next) {
    const d = new Date();
    res.send(
      `Hello express. Created ${creationDate.toString()}. Current ${d.toString()}`
    );
  });

  return router;
};
