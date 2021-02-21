import * as handler from "serverless-express/handler";
import * as express from "serverless-express/express";
import { bootstrap } from "./app";

export const api = handler(bootstrap(express));
