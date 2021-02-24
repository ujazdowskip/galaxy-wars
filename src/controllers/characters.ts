import {
  Controller,
  Prefix,
  Get,
  Post,
  RequestContext,
  Status,
  ValidateBody,
  Parameters,
} from "../core";

import * as dynamodb from "serverless-dynamodb-client";

interface SomeResult {
  params: any;
  query: any;
}

@Prefix("characters")
export class CharactersController extends Controller {
  @Get()
  async listCharacters(reqCtx: RequestContext): Promise<any[]> {
    const docClient = dynamodb.doc;
    const params = {
      TableName: "galaxy-characters",
    };

    return new Promise((resolve, reject) => {
      docClient.scan(params, function (err, data) {
        console.log(err);
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  @Post()
  @ValidateBody({
    type: "object",
    required: ["name", "age"],
    properties: {
      name: {
        type: "string",
      },
      age: {
        type: "number",
      },
    },
  })
  @Status(204)
  createCharacter(reqCtx: RequestContext): void {
    console.log("CREATED", reqCtx.body);
  }

  @Get(":id")
  @Parameters([
    {
      name: "elo",
      in: "query",
      required: false,
      schema: {
        type: "string",
      },
    },
  ])
  getCharacter(reqCtx: RequestContext): SomeResult {
    return {
      params: reqCtx.params,
      query: reqCtx.query,
    };
  }
}
