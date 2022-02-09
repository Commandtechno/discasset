require("../init");

const { output, verbose, concurrency } = require("../config");
const { JS } = require("../download");

const { tokenizer } = require("acorn");
const { writeFile } = require("fs/promises");
const { resolve } = require("path");
const puppeteer = require("puppeteer-lottie");
const chalk = require("chalk");

const prefix = "[" + chalk.bgBlue(chalk.black(" LOTTIE ")) + "]";

module.exports = async function () {
  let GIFSKI_PATH = resolve(require.resolve("gifski"), "..", "bin");
  switch (process.platform) {
    case "win32":
      GIFSKI_PATH = resolve(GIFSKI_PATH, "windows", "gifski.exe");
      break;

    case "darwin":
      GIFSKI_PATH = resolve(GIFSKI_PATH, "macos", "gifski");
      break;

    case "linux":
      GIFSKI_PATH = resolve(GIFSKI_PATH, "debian", "gifski");
      break;

    default:
      console.log(prefix, `Unsupported gifski platform: ${process.platform}`);
      return;
  }

  const map = (await import("p-map")).default;
  const files = await JS();

  console.log(prefix, "Processing", files.length, "files...");
  const assets = [];
  await map(
    files,
    file => {
      for (const { type, value } of tokenizer(file)) {
        if (type.label !== "string" || !value.startsWith("{") || !value.endsWith("}")) continue;

        let asset;
        try {
          asset = JSON.parse(value);
        } catch {
          continue;
        }

        if (
          !asset.v || // version
          !asset.fr || // framerate
          !asset.w || // width
          !asset.h || // height
          !asset.nm // name
        )
          continue;

        assets.push(asset);
      }
    },
    { concurrency }
  );

  console.log(prefix, "Rendering", assets.length, "assets...");
  process.env.GIFSKI_PATH = GIFSKI_PATH;

  for (const asset of assets) {
    const name = asset.nm;
    console.log(prefix, chalk.blue("Rendering"), name);

    const path = resolve(output, "lottie", name);
    await writeFile(path + ".json", JSON.stringify(asset));
    await puppeteer({
      quiet: true,
      output: path + ".gif",
      animationData: asset
    });

    console.log(prefix, chalk.green("Rendering"), name);
  }
};