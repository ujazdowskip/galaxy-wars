import * as createError from "http-errors";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import { Controller } from "./utils/controller";

export function bootstrap(express, controllers: Controller[]) {
  const app = express();
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  controllers.forEach((c) => c.register(app));
  // charactersController.register(app);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    const status = err.status || 500;

    res.status(status);
    res.send(status === 500 ? "Server error" : err.message);
  });

  return app;
}
