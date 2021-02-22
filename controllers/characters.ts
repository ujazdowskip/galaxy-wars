import {
  Controller,
  Prefix,
  Get,
  Post,
  RequestContext,
  Status,
  Api,
} from "../utils/controller";

interface SomeResult {
  params: any;
  query: any;
}

@Prefix("characters")
export class CharactersController extends Controller {
  @Get()
  @Api({
    summary: "basic listing",
  })
  listCharacters(reqCtx: RequestContext): string[] {
    return ["a", "b"];
  }

  @Post()
  @Api({
    summary: "This is creation endpoint",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
              },
            },
          },
        },
      },
    },
  })
  @Status(204)
  createCharacter(reqCtx: RequestContext): void {
    console.log("CREATED", reqCtx.body);
  }

  @Get(":id")
  @Api({
    summary: "some get",
  })
  getCharacter(reqCtx: RequestContext): SomeResult {
    return {
      params: reqCtx.params,
      query: reqCtx.query,
    };
  }
}
