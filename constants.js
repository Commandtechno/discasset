const { environment, host } = require("./config");
const { readFileSync } = require("fs");

const regex = /^[a-zA-Z0-9]{32}$/;
const jsRegex = /^[a-zA-Z0-9]{20}$/;
const baseUrl = "https://" + (environment === "stable" ? "" : environment + ".") + host;
const htmlUrl = new URL("/login", baseUrl).toString();
const assetsUrl = new URL("/assets", baseUrl).toString();
const baseTwemoji = readFileSync("twemoji.svg");

module.exports = {
  regex,
  jsRegex,
  baseUrl,
  htmlUrl,
  assetsUrl,
  baseTwemoji
};