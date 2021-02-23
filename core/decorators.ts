import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import * as set from "lodash.set";

import { Controller, HandlerConfig } from "./controller";

interface HandlerPropertyDescriptior extends PropertyDescriptor {
  value?: HandlerConfig["handler"];
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
  return function (target: Controller, propertyKey: string) {
    set(target, ["statuses", propertyKey], code);
  };
}

export function Parameters(schema: OpenAPIV3.ParameterObject[]) {
  return function (target: Controller, propertyKey: string) {
    set(target, ["apiDocs", propertyKey, "parameters"], schema);
  };
}

export function ValidateBody(schema: OpenAPIV3.SchemaObject) {
  return function (target: Controller, propertyKey: string) {
    set(target, ["apiDocs", propertyKey, "requestBody"], {
      required: true,
      content: {
        "application/json": {
          schema,
        },
      },
    });
  };
}
