import { DynamoDB } from "aws-sdk";

export interface CharacterEntity {
  characterName: string;
  planet?: string;
  episodes: string[];
}

interface ListResult<T> {
  items: T[];
  next?: string;
  count: number;
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
  nextToken?: string;
}

function prepareNextToken(q, data) {
  if (data.LastEvaluatedKey) {
    const next = Object.entries({
      nextToken: data.LastEvaluatedKey.id,
    })
      .map((param) => param.join("="))
      .join("&");

    return next;
  }
}

function getExclusiveStartKey(q: ListQuery) {
  if (!!q.nextToken) {
    return {
      id: q.nextToken,
    };
  }
}

export class CharactersService {
  docClient: any;

  tableName = "galaxy-characters";

  constructor(docClient) {
    this.docClient = docClient;
  }

  list(query: ListQuery = {}): Promise<ListResult<CharacterEntity>> {
    const params: DynamoDB.DocumentClient.QueryInput = {
      Limit: 5,
      TableName: this.tableName,
    };

    const continuationParams = getExclusiveStartKey(query);

    if (continuationParams) {
      params.ExclusiveStartKey = continuationParams;
    }

    return new Promise((resolve, reject) => {
      this.docClient.scan(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        const res: ListResult<CharacterEntity> = {
          items: data.Items,
          count: data.Items.length,
        };
        const nextToken = prepareNextToken(query, data);

        if (nextToken) {
          res.next = nextToken;
        }

        resolve(res);
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
