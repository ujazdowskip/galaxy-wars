# Toy API to for imaginary Galaxy Wars movie franchise

## Running

`npm run start:dev`

## Testing

`npm test` - unit and integration tests

For E2E tests:
- `npm run start:dev`
- `npm run test:e2e`

## Architecture

The core of app is Controller which is thin wrapper over express.

Episodes are magic strings inside characters service - they will not make new movie every week! And 
if they will start doing that it'll be resonably easy to switch to retrieving episodes from
somewhere (db, API).

## TODO

- better test coverage
- filtering for listing endpoint
- Swagger UI integration
