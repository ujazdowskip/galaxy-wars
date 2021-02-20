"use strict";

const handler = require("serverless-express/handler");
const bootstrap = require("./app");

const creationTime = new Date();

module.exports.api = handler(bootstrap(creationTime));
