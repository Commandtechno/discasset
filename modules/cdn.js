require("../init");

const { output, verbose, concurrency } = require("../config");
const constants = require("../constants");
const download = require("../download").JS;

const { resolve, extname, basename } = require("path");
const { tokenizer } = require("acorn");
const { writeFile } = require("fs/promises");
const robert = require("robert").default;
const chalk = require("chalk");
const mime = require("mime-types");

const extensions = new Set(Object.keys(mime.types));
const prefix = "[" + chalk.bgBlue(chalk.black(" CDN ")) + "]";

module.exports = async function () {
  const map = (await import("p-map")).default;
  const files = await download();

  console.log(prefix, "Processing", files.length, "files...");
  const assets = [];
  await map(
    files,
    file => {
      for (const { type, value } of tokenizer(file, { ecmaVersion: "latest" })) {
        if (type.label !== "string") continue;

        const ext = extname(value);
        if (!ext || !extensions.has(ext.slice(1))) continue;

        const name = basename(value, ext);
        if (!constants.regex.test(name)) continue;

        assets.push(value);
      }
    },
    { concurrency }
  );

  console.log(prefix, "Downloading", assets.length, "assets...");
  await map(assets, async asset => {
    const url = new URL("/assets/" + asset, constants.assetsUrl).toString();
    if (verbose) console.log(prefix, chalk.blue("Fetching"), url);

    const file = await robert.get(url).send("buffer");
    if (verbose) console.log(prefix, chalk.green("Fetched"), url);

    let path = resolve(output, "cdn");
    if (file.includes(constants.baseTwemoji)) path = resolve(path, "twemoji");

    path = resolve(path, asset);
    await writeFile(path, file);
  });

  console.log(prefix, "Done");
};