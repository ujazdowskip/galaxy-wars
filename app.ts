import * as createError from "http-errors";
import * as bodyParser from "body-parser";
import * as logger from "morgan";

import { CharactersController } from "./controllers/characters";

export function bootstrap(express) {
  const app = express();
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const charactersController = new CharactersController();

  charactersController.register(app);

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
}
