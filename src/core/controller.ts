import { Router, Request } from "express";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import * as set from "lodash.set";

export interface RequestContext {
  params: Request["params"];
  query: Request["query"];
  body: Request["body"];
}

interface JSONResponse {
  [key: string]: any;
}

type ControllerHandler = (
  r: RequestContext
) => Promise<string | void | object> | string | void | JSONResponse;

export interface HandlerConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  handler: ControllerHandler;
  path: string;
}

interface HandlerMap {
  [name: string]: HandlerConfig;
}

interface StatusMap {
  [name: string]: number;
}

export class Controller {
  router: Router;

  path: string;

  handlers: HandlerMap;

  statuses: StatusMap;

  apiDocs?: {
    [key: string]: any;
  };

  constructor() {
    this.router = Router();
  }

  installRoutes(): void {
    Object.keys(this.handlers).forEach((key) => {
      const { method, path, handler } = this.handlers[key];
      const status = this.statuses && this.statuses[key];
      const handlerWrapper = (req, res, next) => {
        const ctx: RequestContext = {
          params: req.params,
          query: req.query,
          body: req.body,
        };

        if (status) {
          res.status(status);
        }

        try {
          const result = handler.call(this, ctx);
          if (
            result &&
            typeof result === "object" &&
            typeof result.then === "function"
          ) {
            result
              .then((d) => {
                res.send(d);
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.send(result);
          }
        } catch (error) {
          next(error);
        }
      };

      switch (method) {
        case "GET":
          this.router.get("/" + path, handlerWrapper);
          break;
        case "POST":
          this.router.post("/" + path, handlerWrapper);
          break;
        case "PUT":
          this.router.put("/" + path, handlerWrapper);
          break;
        case "PATCH":
          this.router.patch("/" + path, handlerWrapper);
          break;
        case "DELETE":
          this.router.delete("/" + path, handlerWrapper);
          break;
        default:
          throw new Error("Unknown method");
      }
    });
  }

  getApiSpec(): { paths: OpenAPIV3.PathsObject } {
    let routerPath = "/";
    const pathsConfig = { paths: {} };

    if (this.path) {
      routerPath += this.path;
    }

    Object.keys(this.handlers).forEach((operationId) => {
      const { path, method } = this.handlers[operationId];
      let endpoint = routerPath + "/" + path;
      let openApiEndpoint = endpoint
        .split("/")
        .map((part) => {
          if (part[0] === ":") {
            return `{${part.slice(1)}}`;
          }

          return part;
        })
        .filter((a) => a)
        .join("/");

      if (openApiEndpoint[openApiEndpoint.length - 1] === "/") {
        openApiEndpoint = openApiEndpoint.slice(0, openApiEndpoint.length - 1);
      }

      set(pathsConfig.paths, ["/" + openApiEndpoint, method.toLowerCase()], {
        operationId,
        responses: {}, // OpenApiValidator does not allow this undefined
        ...(this.apiDocs ? this.apiDocs[operationId] : {}),
      });
    });

    return pathsConfig;
  }

  register(app): void {
    let routerPath = "/";

    if (this.path) {
      routerPath += this.path;
    }

    // installing routes have to be deffered - OpenApiValidatur must come first
    this.installRoutes();

    app.use(routerPath, this.router);
  }
}
