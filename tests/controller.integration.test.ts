import * as request from "supertest";
import { bootstrap } from "../src/app";
import {
  Controller,
  Get,
  Prefix,
  RequestContext,
  Post,
  Parameters,
  ValidateBody,
} from "../src/core";
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
    // When
    const response = await request(app).get("/test/string");

    // Then
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toBe("ok");
  });

  test("It should handle sync json", async () => {
    // When
    const response = await request(app).get("/test/json");

    // Then
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.body).toStrictEqual({ data: "ok" });
  });

  test("It should handle async json", async () => {
    // When
    const response = await request(app).get("/test/async");

    // Then
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.body).toStrictEqual({ data: "async" });
  });

  test("It should handle sync error", async () => {
    // When
    const response = await request(app).get("/test/err-sync");

    // Then
    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toStrictEqual("Server error");
  });

  test("It should handle async error", async () => {
    // When
    const response = await request(app).get("/test/err-async");

    // Then
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
    // When
    const response = await request(app).get("/");
    expect(response.text).toEqual("index");
  });

  test("It should handle non existing endpoint", async () => {
    // When
    const response = await request(app).get("/non-existing");

    // Then
    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.text).toBe("not found");
  });

  test("It should work without prefix", async () => {
    // When
    const response = await request(app).get("/foo");

    // Then
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
    // When
    const response = await request(app).get("/1");

    // Then
    expect(response.body).toStrictEqual({
      params: {
        id: "1",
      },
      query: {},
    });
  });

  test("It should handle body", async () => {
    // When
    const response = await request(app).post("/").send({ foo: "bar" });

    // Then
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
    // When
    const response = await request(app).get("/with-query?foo=bar");

    // Then
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      query: {
        foo: "bar",
      },
    });
  });

  test("It should prevent unknown query", async () => {
    // When
    const response = await request(app).get("/no-query?foo=bar");

    // Then
    expect(response.statusCode).toBe(400);
    expect(response.text).toStrictEqual("Unknown query parameter 'foo'");
  });
});

describe("Controller validates body", () => {
  let app;
  beforeAll(() => {
    class TestController extends Controller {
      @Post()
      @ValidateBody({
        type: "object",
        required: ["foo"],
        properties: {
          foo: {
            type: "string",
          },
        },
      })
      hasQuery(r: RequestContext): any {
        return r.body;
      }
    }

    app = bootstrap(express, [new TestController()]);
  });

  test("It should prevent invalid body", async () => {
    // When
    const response = await request(app).post("/").send({});

    // Then
    expect(response.statusCode).toBe(400);
    expect(response.text).toStrictEqual(
      "request.body should have required property 'foo'"
    );
  });

  test("It should allow valid body", async () => {
    // When
    const response = await request(app).post("/").send({ foo: "bar" });

    // Then
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      foo: "bar",
    });
  });
});
