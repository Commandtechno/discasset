require("acorn").defaultOptions.ecmaVersion = "latest";
require("robert").default.timeout("0");

const { existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");
const config = require("./config");

if (!existsSync(resolve(config.output, "cdn", "twemoji")))
  mkdirSync(resolve(config.output, "cdn", "twemoji"), { recursive: true });

if (!existsSync(resolve(config.output, "css")))
  mkdirSync(resolve(config.output, "css"), { recursive: true });

if (!existsSync(resolve(config.output, "lottie")))
  mkdirSync(resolve(config.output, "lottie"), { recursive: true });

if (!existsSync(resolve(config.output, "svg")))
  mkdirSync(resolve(config.output, "svg"), { recursive: true });