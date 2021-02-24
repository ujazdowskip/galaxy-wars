import {
  CharactersService,
  InvalidEpisodes,
} from "../services/characters.service";
import { CharactersController } from "./characters.controller";
import { RequestContext } from "../core/controller";

const getRequestContext = (
  body = {},
  params = {},
  query = {}
): RequestContext => ({
  body,
  params,
  query,
});

describe("CharactersService", () => {
  test("validating episodes", async () => {
    // Given
    const err: any = new InvalidEpisodes(["foo"]);

    CharactersService.prototype.create = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.reject(err);
      });

    const controller = new CharactersController(new CharactersService({}));

    // When
    const createProm = controller.createCharacter(getRequestContext());

    // Then
    await expect(createProm).rejects.toThrow("Unknown episodes: foo");
    expect(err.status).toBe(400);
  });
});
