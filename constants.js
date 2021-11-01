const { readFileSync } = require("fs");
const { enviornment, host } = require("./config");

const base = "https://" + (enviornment === "stable" ? "" : enviornment + ".") + host;
const url = base + "/login";
const assets = base + "/assets";
const twemoji = readFileSync("twemoji.svg");
const regex = /^[a-zA-Z0-9]{32}$/;
const jsRegex = /^[a-zA-Z0-9]{20}$/;

module.exports = {
  base,
  url,
  assets,
  twemoji,
  regex,
  jsRegex
};