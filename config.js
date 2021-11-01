const { existsSync, mkdirSync } = require("fs");
const parser = require("yargs-parser");

const alias = {
  enviornment: ["branch", "env", "e"],
  host: ["h"],
  output: ["out", "o"],
  verbose: ["v"]
};

const config = {
  enviornment: "canary",
  host: "discord.com",
  output: "output",
  verbose: false
};

const args = process.argv.slice(2);
Object.assign(config, parser(args, { alias }));

if (!existsSync(config.output)) mkdirSync(config.output);
if (!existsSync(config.output + "/cdn")) mkdirSync(config.output + "/cdn");
if (!existsSync(config.output + "/cdn/twemoji")) mkdirSync(config.output + "/cdn/twemoji");
if (!existsSync(config.output + "/css")) mkdirSync(config.output + "/css");
if (!existsSync(config.output + "/lottie")) mkdirSync(config.output + "/lottie");
if (!existsSync(config.output + "/lottie/gif")) mkdirSync(config.output + "/lottie/gif");
if (!existsSync(config.output + "/lottie/json")) mkdirSync(config.output + "/lottie/json");
if (!existsSync(config.output + "/svg")) mkdirSync(config.output + "/svg");

module.exports = config;