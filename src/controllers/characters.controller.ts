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

import {
  CharactersService,
  CharacterEntity,
  INVALID_EPISODES,
} from "../services/characters.service";

@Prefix("characters")
export class CharactersController extends Controller {
  charactersService: CharactersService;

  constructor(charactersService: CharactersService) {
    super();
    this.charactersService = charactersService;
  }

  @Get()
  @Parameters([
    {
      name: "planet",
      in: "query",
      required: false,
      schema: {
        type: "string",
      },
    },
    {
      name: "characterName",
      in: "query",
      required: false,
      schema: {
        type: "string",
      },
    },
  ])
  async listCharacters(reqCtx: RequestContext) {
    const characters = await this.charactersService.list(reqCtx.query);

    return {
      result: characters,
    };
  }

  @Post()
  @ValidateBody({
    type: "object",
    required: ["characterName", "episodes"],
    properties: {
      characterName: {
        type: "string",
      },
      planet: {
        type: "string",
      },
      episodes: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  })
  @Status(204)
  async createCharacter(reqCtx: RequestContext): Promise<void> {
    const toCreate = reqCtx.body as CharacterEntity;

    try {
      await this.charactersService.create(toCreate);
    } catch (error) {
      if (error[INVALID_EPISODES]) {
        error.status = 400;
      }

      throw error;
    }
  }
}
