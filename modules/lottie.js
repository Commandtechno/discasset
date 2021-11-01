const { output, verbose } = require("../config");
const { GIFSKI, JS } = require("../download");

const { writeFile, rename } = require("fs/promises");
const { execFile } = require("child_process");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

let puppeteer;
try {
  puppeteer = require("puppeteer-lottie");
} catch {}

async function main() {
  if (!puppeteer) {
    if (process.platform !== "win32") {
      console.log("Puppeteer lottie not found, can only use rlottie on windows");
      process.exit();
    }

    await GIFSKI();
  }

  const resolve = (await import("p-all")).default;
  const files = await JS();

  console.log("Parsing JavaScript");
  const assets = [];
  for await (const file of files)
    traverse(parse(file), {
      enter({ node }) {
        if ("CallExpression" !== node.type) return;

        const {
          arguments: args,
          callee: { object, property }
        } = node;

        if (
          !object ||
          !property ||
          object.type !== "Identifier" ||
          object.name !== "JSON" ||
          property.type !== "Identifier" ||
          property.name !== "parse" ||
          args.length !== 1
        )
          return;

        const [{ type, value }] = args;
        if (type !== "StringLiteral") return;

        const asset = JSON.parse(value);
        if (
          !asset.v || // version
          !asset.fr || // framerate
          !asset.w || // width
          !asset.h || // height
          !asset.nm // name
        )
          return;

        assets.push(asset);
      }
    });

  console.log("Rendering assets");
  const promises = assets.map(asset => async () => {
    if (verbose) console.log("Rendering " + asset.nm);

    const json = output + "/lottie/json/" + asset.nm + ".json";
    const gif = output + "/lottie/gif/" + asset.nm + ".gif";
    await writeFile(json, JSON.stringify(asset));

    if (puppeteer)
      await puppeteer({
        quiet: true,
        output: gif,
        animationData: asset
      });
    else {
      await new Promise(resolve => execFile("static/lottie2gif", [json, "500x500"], resolve));
      await rename(asset.nm + ".json.gif", gif);
    }

    if (verbose) console.log("Rendered " + asset.nm);
  });

  await resolve(promises, { concurrency: 10 });
  return promises.length;
}

if (require.main === module) main();
else module.exports = main;