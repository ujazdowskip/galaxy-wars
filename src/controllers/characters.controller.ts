import * as createError from "http-errors";
import {
  Controller,
  Prefix,
  Get,
  Post,
  RequestContext,
  Status,
  ValidateBody,
  Parameters,
  Patch,
  Delete,
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
      name: "nextToken",
      in: "query",
      required: false,
      schema: { type: "string" },
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
      await this.charactersService.put(toCreate);
    } catch (error) {
      if (error[INVALID_EPISODES]) {
        error.status = 400;
      }

      throw error;
    }
  }

  @Status(204)
  @Patch(":id")
  @ValidateBody({
    type: "object",
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
  async modifyCharacter(reqCtx: RequestContext): Promise<void> {
    const toUpdate = reqCtx.body as CharacterEntity;

    const res = await this.charactersService.get(reqCtx.params.id);

    if (!res) {
      throw createError(404);
    }

    try {
      await this.charactersService.put({
        ...res,
        ...toUpdate,
      });
    } catch (error) {
      if (error[INVALID_EPISODES]) {
        error.status = 400;
      }

      throw error;
    }
  }

  @Get(":id")
  async getCharacter(reqCtx: RequestContext) {
    const res = await this.charactersService.get(reqCtx.params.id);

    if (!res) {
      throw createError(404);
    }

    return res;
  }

  @Status(204)
  @Delete(":id")
  async deleteCharacter(reqCtx: RequestContext) {
    const res = await this.charactersService.get(reqCtx.params.id);

    if (!res) {
      throw createError(404);
    }

    await this.charactersService.delete(reqCtx.params.id);
  }
}
