import * as handler from "serverless-express/handler";
import * as express from "serverless-express/express";
import { bootstrap } from "./app";

import { CharactersController } from "./controllers/characters";

const charactersController = new CharactersController();
const app = bootstrap(express, [charactersController]);

// FIXME: something is not right - app is bootstrapping every time handler is called
// check if also apply to deployed lambda

export const api = handler(app);
