import {
  Controller,
  Prefix,
  Get,
  Post,
  RequestContext,
  Status,
  ValidateBody,
  Parameters,
} from "../utils/controller";

interface SomeResult {
  params: any;
  query: any;
}

@Prefix("characters")
export class CharactersController extends Controller {
  @Get()
  listCharacters(reqCtx: RequestContext): string[] {
    return ["a", "b"];
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
