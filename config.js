const { resolve } = require("path");

module.exports = {
  environment: "canary",
  host: "discord.com",
  output: resolve(__dirname, "output"),
  verbose: true,
  concurrency: 100
};