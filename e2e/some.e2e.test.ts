const request = require("request");

describe("Galaxy Wars E2E tests", () => {
  test("/characters endpoint", (done) => {
    request(
      "http://localhost:3000/local/characters",
      { json: true },
      (err, res, body) => {
        if (err) {
          return done(err);
        }
        expect(body).toMatchSnapshot();
        done();
      }
    );
  });
});
