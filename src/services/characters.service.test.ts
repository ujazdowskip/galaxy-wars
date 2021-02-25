import { CharactersService, InvalidEpisodes } from "./characters.service";

describe("CharactersService planet validation", () => {
  test("validating episodes", async () => {
    // Given
    const service = new CharactersService(jest.fn());

    // When
    const createProm = service.create({
      characterName: "foo",
      episodes: ["NON EXISTING EPISODE", "ANOTHER ONE"],
    });

    // Then
    await expect(createProm).rejects.toThrow(
      new InvalidEpisodes(["NON EXISTING EPISODE", "ANOTHER ONE"])
    );
  });
});

describe("CharactersService list query", () => {
  test("preparing query", async () => {
    // Given
    const scanSpy = jest.fn((param, cb) => cb(null, {}));
    const service = new CharactersService({ scan: scanSpy });

    // When
    await service.list({ planet: "foo", characterName: "bar" });

    // Then
    expect(scanSpy).toHaveBeenCalledWith(
      {
        ExpressionAttributeValues: {
          ":planet": "foo",
          ":characterName": "bar",
        },
        FilterExpression: "planet = :planet AND characterName = :characterName",
        TableName: "galaxy-characters",
      },
      expect.anything()
    );
  });
});
