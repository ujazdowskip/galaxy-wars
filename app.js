const createError = require("http-errors");
const express = require("serverless-express/express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");

module.exports = (creationDate) => {
  const app = express();

  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use("/", indexRouter(creationDate));

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err.message);
  });

  return app;
};
