import { CharactersService, InvalidEpisodes } from "./characters.service";

describe("CharactersService", () => {
  test("validating episodes", async () => {
    // Given
    const service = new CharactersService(jest.fn());

    // When
    const createProm = service.create({
      name: "foo",
      episodes: ["NON EXISTING EPISODE", "ANOTHER ONE"],
    });

    // Then
    await expect(createProm).rejects.toThrow(
      new InvalidEpisodes(["NON EXISTING EPISODE", "ANOTHER ONE"])
    );
  });
});
