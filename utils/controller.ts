import { Router, Request } from "express";

export interface RequestContext {
  params: Request["params"];
  query: Request["query"];
  body: Request["body"];
}

type ControllerHandler = (r: RequestContext) => string | number | void | object;

interface HandlerConfig {
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

interface HandlerPropertyDescriptior extends PropertyDescriptor {
  value?: ControllerHandler;
}

export const Prefix = (path) => <T extends { new (...args: any[]): {} }>(
  constructor: T
) => {
  return class extends constructor {
    path = path;
  };
};

function MethodFactory(method: HandlerConfig["method"]) {
  return function (path: string = "") {
    return function (
      target: Controller,
      propertyKey: string,
      descriptor: HandlerPropertyDescriptior
    ) {
      if (!target.handlers) {
        target.handlers = {};
      }

      if (descriptor.value) {
        target.handlers[propertyKey] = {
          method,
          path: path,
          handler: descriptor.value,
        };
      }
    };
  };
}

export const Get = MethodFactory("GET");
export const Post = MethodFactory("POST");
export const Put = MethodFactory("PUT");
export const Patch = MethodFactory("PATCH");
export const Delete = MethodFactory("DELETE");

export function Status(code: number) {
  return function (
    target: Controller,
    propertyKey: string,
    descriptor: HandlerPropertyDescriptior
  ) {
    if (!target.statuses) {
      target.statuses = {};
    }

    if (descriptor.value) {
      target.statuses[propertyKey] = code;
    }
  };
}

export class Controller {
  router: Router;

  path: string;

  handlers: HandlerMap;

  statuses: StatusMap;

  constructor() {
    this.router = Router();

    Object.keys(this.handlers).forEach((key) => {
      const { method, path, handler } = this.handlers[key];
      const status = this.statuses && this.statuses[key];
      const handlerWrapper = (req, res) => {
        const ctx: RequestContext = {
          params: req.params,
          query: req.query,
          body: req.body,
        };
        const result = handler(ctx);

        if (status) {
          res.status(status);
        }

        res.send(result);
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

  register(app) {
    app.use("/" + this.path, this.router);
  }
}
