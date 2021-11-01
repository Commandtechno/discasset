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
if (!existsSync(config.output + "/svg")) mkdirSync(config.output + "/svg");

process.env.GIFSKI_PATH = __dirname + "/gifski/";
switch (process.platform) {
  case "win32":
    process.env.GIFSKI_PATH += "win/gifski.exe";
    break;
  case "darwin":
    process.env.GIFSKI_PATH += "mac/gifski";
    break;
  case "linux":
    process.env.GIFSKI_PATH += "debian/gifski";
    break;
  default:
    console.warn("Unsupported platform: " + process.platform);
}

module.exports = config;