require("../init");

const { output, verbose, concurrency } = require("../config");
const constants = require("../constants");
const download = require("../download").JS;

const { resolve, extname, basename } = require("path");
const { existsSync } = require("fs");
const { writeFile } = require("fs/promises");
const { tokenizer } = require("acorn");
const robert = require("robert").default;
const chalk = require("chalk");
const mime = require("mime-types");

const extensions = new Set(Object.keys(mime.types));
const prefix = "[" + chalk.bgBlue(chalk.black(" CDN ")) + "]";

module.exports = async function () {
  const map = (await import("p-map")).default;
  const files = await download();

  console.log(prefix, "Processing", files.length, "files...");
  const assets = new Set();
  await map(
    files,
    file => {
      for (const { type, value } of tokenizer(file, {
        ecmaVersion: "latest"
      })) {
        if (type.label !== "string") continue;

        const ext = extname(value);
        if (!ext || !extensions.has(ext.slice(1))) continue;

        const name = basename(value, ext);
        if (!constants.regex.test(name)) continue;

        assets.add(value);
      }
    },
    { concurrency }
  );

  console.log(prefix, "Downloading", assets.size, "assets...");
  await map(assets, async asset => {
    let url = new URL("/assets/" + asset, constants.assetsUrl).toString();
    let path = resolve(output, "cdn", asset);
    let twemojiPath = resolve(output, "cdn", "twemoji", asset);
    if (existsSync(path) || existsSync(twemojiPath)) {
      if (verbose) console.log(prefix, chalk.blue("Skipping"), url);
      return;
    }

    if (verbose) console.log(prefix, chalk.blue("Fetching"), url);

    const file = await robert.get(url).send("buffer");
    if (verbose) console.log(prefix, chalk.green("Fetched"), url);

    if (file.includes(constants.baseTwemoji)) path = twemojiPath;
    await writeFile(path, file);
  });

  console.log(prefix, "Done");
};
