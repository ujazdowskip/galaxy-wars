import * as handler from "serverless-express/handler";
import * as express from "serverless-express/express";
import { bootstrap } from "./app";

import { CharactersController } from "./controllers/characters";

const charactersController = new CharactersController();
const app = bootstrap(express, [charactersController]);

export const api = handler(app);
