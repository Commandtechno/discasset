require("../init");

const { output, verbose, concurrency } = require("../config");
const { assetsUrl } = require("../constants");
const download = require("../download").CSS;

const { resolve, extname } = require("path");
const { parse, walk } = require("css-tree");
const { writeFile } = require("fs/promises");
const { extension } = require("mime-types");
const parseURI = require("data-urls");
const robert = require("robert").default;
const chalk = require("chalk");

const prefix = "[" + chalk.bgBlue(chalk.black(" CSS ")) + "]";

module.exports = async function () {
  const map = (await import("p-map")).default;

  const file = await download();
  const assets = [];

  let parent;
  let ignore;

  console.log(prefix, "Processing file...");
  walk(parse(file), ({ type, name, value, property }) => {
    switch (type) {
      case "ClassSelector":
        parent = name.replace(/-\w+$/, "");
        break;

      case "Declaration":
        ignore = property.startsWith("-webkit");
        break;

      case "Url":
        if (ignore) break;
        assets.push({
          name: parent,
          type: value.type,
          value: value.value
        });

        break;
    }
  });

  console.log(prefix, "Downloading", assets.length, "assets...");
  await map(
    assets,
    async ({ name, type, value }) => {
      let path = resolve(output, "css", name);
      let data;

      switch (type) {
        case "String":
          const uri = parseURI(value.slice(1, -1));
          path += extension(uri.mimeType.toString());
          data = uri.body;
          break;

        case "Raw":
          if (value.startsWith("#")) {
            if (verbose) console.log(prefix, chalk.yellow("Skipping"), value);
            return;
          }

          path += extname(value);

          const url = new URL(value, assetsUrl).toString();
          if (verbose) console.log(prefix, chalk.blue("Fetching"), url);

          data = await robert.get(url).send("buffer");
          if (verbose) console.log(prefix, chalk.green("Fetched"), url);
          break;
      }

      await writeFile(path, data);
    },
    { concurrency }
  );

  console.log(prefix, "Done");
};