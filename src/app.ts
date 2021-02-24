import * as createError from "http-errors";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import { Controller } from "./core";
import * as OpenApiValidator from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import * as appPackage from "../package.json";

const apiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Galaxy Wars API",
    version: appPackage.version,
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
    const env = req.app.get("env");
    const status = err.status || 500;

    res.status(status);

    if (env === "development") {
      res.send(err);
    } else {
      res.send(status === 500 ? "Server error" : err.message);
    }
  });

  console.log(`Galaxy Wars ${appPackage.version}`);

  return app;
}
