import * as request from "supertest";
import { bootstrap } from "../app";
import {
  Controller,
  Get,
  Prefix,
  RequestContext,
  Post,
  Parameters,
} from "../utils/controller";
import * as express from "express";

describe("Controller return types", () => {
  let app;
  beforeAll(() => {
    @Prefix("test")
    class TestController extends Controller {
      @Get("string")
      str(): string {
        return "ok";
      }

      @Get("json")
      num(): object {
        return { data: "ok" };
      }

      @Get("async")
      async asyncHandler(): Promise<object> {
        return { data: "async" };
      }

      @Get("err-sync")
      syncErr(): void {
        throw new Error("boom");
      }

      @Get("err-async")
      async promErr(): Promise<object> {
        throw new Error("boom");
      }
    }

    app = bootstrap(express, [new TestController()]);
  });

  test("It should handle sync text", async () => {
    const response = await request(app).get("/test/string");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toBe("ok");
  });

  test("It should handle sync json", async () => {
    const response = await request(app).get("/test/json");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.body).toStrictEqual({ data: "ok" });
  });

  test("It should handle async json", async () => {
    const response = await request(app).get("/test/async");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.body).toStrictEqual({ data: "async" });
  });

  test("It should handle sync error", async () => {
    const response = await request(app).get("/test/err-sync");
    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toStrictEqual("Server error");
  });

  test("It should handle async error", async () => {
    const response = await request(app).get("/test/err-async");
    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toStrictEqual("Server error");
  });
});

describe("Controller routing", () => {
  let app;
  beforeAll(() => {
    class WithoutPrefixController extends Controller {
      @Get()
      index(): string {
        return "index";
      }

      @Get("foo")
      foo(): string {
        return "foo";
      }
    }

    app = bootstrap(express, [new WithoutPrefixController()]);
  });

  test("It should handle index", async () => {
    const response = await request(app).get("/");
    expect(response.text).toEqual("index");
  });

  test("It should handle non existing endpoint", async () => {
    const response = await request(app).get("/non-existing");
    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toBe("not found");
  });

  test("It should work without prefix", async () => {
    const response = await request(app).get("/foo");
    expect(response.text).toEqual("foo");
  });
});

describe("Controller request context", () => {
  let app;
  beforeAll(() => {
    class TestController extends Controller {
      @Get(":id")
      handler(r: RequestContext): any {
        return {
          params: r.params,
          query: r.query,
        };
      }

      @Post()
      postHandler(r: RequestContext): any {
        return {
          body: r.body,
        };
      }
    }

    app = bootstrap(express, [new TestController()]);
  });

  test("It should handle parameters", async () => {
    const response = await request(app).get("/1");
    expect(response.body).toStrictEqual({
      params: {
        id: "1",
      },
      query: {},
    });
  });

  test("It should handle body", async () => {
    const response = await request(app).post("/").send({ foo: "bar" });
    expect(response.body).toStrictEqual({
      body: {
        foo: "bar",
      },
    });
  });
});

describe("Controller query params", () => {
  let app;
  beforeAll(() => {
    class TestController extends Controller {
      @Get("with-query")
      @Parameters([
        {
          name: "foo",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
        },
      ])
      hasQuery(r: RequestContext): any {
        return {
          query: r.query,
        };
      }

      @Get("no-query")
      noQuery(r: RequestContext): any {
        return {
          query: r.query,
        };
      }
    }

    app = bootstrap(express, [new TestController()]);
  });

  test("It should handle query", async () => {
    const response = await request(app).get("/with-query?foo=bar");
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      query: {
        foo: "bar",
      },
    });
  });

  test("It should prevent unknown query", async () => {
    const response = await request(app).get("/no-query?foo=bar");
    expect(response.statusCode).toBe(400);
    expect(response.text).toStrictEqual("Unknown query parameter 'foo'");
  });
});
