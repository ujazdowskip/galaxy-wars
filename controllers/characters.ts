import {
  Controller,
  Prefix,
  Get,
  Post,
  RequestContext,
  Status,
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
  @Status(204)
  createCharacter(reqCtx: RequestContext): void {
    console.log("CREATED", reqCtx.body);
  }

  @Get(":id")
  getCharacter(reqCtx: RequestContext): SomeResult {
    return {
      params: reqCtx.params,
      query: reqCtx.query,
    };
  }
}
