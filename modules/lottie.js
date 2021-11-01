const { output, verbose } = require("../config");
const download = require("../download").JS;

const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const render = require("puppeteer-lottie");

async function main() {
  const resolve = (await import("p-all")).default;
  const files = await download();

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
    const path = output + "/lottie/" + asset.nm + ".gif";
    await render({
      quiet: true,
      output: path,
      animationData: asset
    });

    if (verbose) console.log("Rendered" + asset.nm);
  });

  await resolve(promises, { concurrency: 10 });
  return promises.length;
}

if (require.main === module) main();
else module.exports = main;