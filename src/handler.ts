import * as handler from "serverless-express/handler";
import * as express from "serverless-express/express";
import * as dynamodb from "serverless-dynamodb-client";
import { bootstrap } from "./app";

import { CharactersController } from "./controllers/characters.controller";
import { CharactersService } from "./services/characters.service";

const charactersService = new CharactersService(dynamodb.doc);

const charactersController = new CharactersController(charactersService);

const app = bootstrap(express, [charactersController]);

export const api = handler(app);
