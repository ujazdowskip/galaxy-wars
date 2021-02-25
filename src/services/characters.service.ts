import { DynamoDB } from "aws-sdk";

export interface CharacterEntity {
  characterName: string;
  planet?: string;
  episodes: string[];
}

const VALID_EPISODES = ["OLD HOPE", "STAR NINJA", "PEW PEW"];

export const INVALID_EPISODES = Symbol("INVALID_EPISODES");

export class InvalidEpisodes extends Error {
  constructor(episodes: string[]) {
    super();
    this.message = `Unknown episodes: ${episodes.join(", ")}`;
    this[INVALID_EPISODES] = true;
  }
}

interface ListQuery {
  planet?: string;
  characterName?: string;
}

export class CharactersService {
  docClient: any;

  tableName = "galaxy-characters";

  constructor(docClient) {
    this.docClient = docClient;
  }

  private prepareQuery(query: ListQuery) {
    let FilterExpression: string[] = [];
    let ExpressionAttributeValues = {};

    Object.keys(query).forEach((key) => {
      FilterExpression.push(`${key} = :${key}`);
      ExpressionAttributeValues[`:${key}`] = query[key];
    });

    return {
      FilterExpression: FilterExpression.join(" AND "),
      ExpressionAttributeValues,
    };
  }

  list(query: ListQuery = {}): Promise<CharacterEntity[]> {
    const preparedQuery =
      Object.keys(query).length > 0 ? this.prepareQuery(query) : {};

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
      ...preparedQuery,
    };

    return new Promise((resolve, reject) => {
      this.docClient.scan(params, function (err, data) {
        if (err) {
          return reject(err);
        }

        resolve(data.Items);
      });
    });
  }

  create(item: CharacterEntity): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: item,
    };

    return new Promise((resolve, reject) => {
      this.validateEpisodes(item.episodes);

      this.docClient.put(params, function (err) {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  private validateEpisodes(episodes: string[]) {
    episodes.forEach((ep) => {
      const unknownEpisodes = episodes.filter(
        (x) => !VALID_EPISODES.includes(x)
      );

      if (unknownEpisodes.length > 0) {
        throw new InvalidEpisodes(unknownEpisodes);
      }
    });
  }
}
