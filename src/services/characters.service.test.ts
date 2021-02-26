import { CharactersService, InvalidEpisodes } from "./characters.service";

describe("CharactersService planet validation", () => {
  test("validating episodes", async () => {
    // Given
    const service = new CharactersService(jest.fn());

    // When
    const createProm = service.put({
      characterName: "foo",
      episodes: ["NON EXISTING EPISODE", "ANOTHER ONE"],
    });

    // Then
    await expect(createProm).rejects.toThrow(
      new InvalidEpisodes(["NON EXISTING EPISODE", "ANOTHER ONE"])
    );
  });

  test("missing episodes does not throw error", async () => {
    // Given
    const service = new CharactersService(jest.fn());

    // When
    const createProm = service.put({
      characterName: "foo",
    });

    // Then
    await expect(createProm).rejects.not.toThrow(
      new InvalidEpisodes(["NON EXISTING EPISODE", "ANOTHER ONE"])
    );
  });
});

describe("CharactersService list query", () => {
  test("handling start key", async () => {
    // Given
    const scanSpy = jest.fn((param, cb) =>
      cb(null, {
        Items: [1, 2, 3],
      })
    );
    const service = new CharactersService({ scan: scanSpy });

    // When
    await service.list({ nextToken: "123-asd" });

    // Then
    expect(scanSpy).toHaveBeenCalledWith(
      {
        ExclusiveStartKey: {
          id: "123-asd",
        },
        Limit: 5,
        TableName: "galaxy-characters",
      },
      expect.anything()
    );
  });
});
