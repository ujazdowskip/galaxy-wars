import * as createError from "http-errors";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import { Controller } from "./utils/controller";
import * as OpenApiValidator from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

const apiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Galaxy Wars API",
    version: "1.0", // TODO: het this from package.json
  },
  paths: {},
};

export function bootstrap(express, controllers: Controller[]) {
  const app = express();
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(bodyParser.urlencoded({ extended: false }));

  const controllersSpecs = controllers.map((c) => c.getApiSpec());

  controllersSpecs.forEach((spec) => {
    apiSpec.paths = {
      ...apiSpec.paths,
      ...spec.paths,
    };
  });

  app.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpec,
    })
  );

  controllers.forEach((c) => c.register(app));

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
