const { output, verbose } = require("../config");
const constants = require("../constants");
const download = require("../download").JS;

const { extname, basename } = require("path");
const { writeFile } = require("fs/promises");
const { parse } = require("@babel/parser");

const traverse = require("@babel/traverse").default;
const robert = require("robert");
const mime = require("mime-types");

const extensions = new Set(Object.keys(mime.types));

async function main() {
  const resolve = (await import("p-all")).default;
  const files = await download();

  console.log("Parsing JavaScript");
  const assets = [];
  for await (const file of files)
    traverse(parse(file), {
      enter({ node: { type, value } }) {
        if (type !== "StringLiteral") return;

        const ext = extname(value);
        if (!ext || !extensions.has(ext.slice(1))) return;

        const name = basename(value, ext);
        if (!constants.regex.test(name)) return;

        assets.push(value);
      }
    });

  console.log("Downloading assets");
  const promises = assets.map(asset => async () => {
    const url = constants.assets + "/" + asset;

    if (verbose) console.log("Fetching " + url);
    const file = await robert.get(url).send("buffer");

    let path = output + "/cdn";
    if (file.includes(constants.twemoji)) path += "/twemoji";
    path += "/" + asset;

    if (verbose) console.log("Writing " + path);
    await writeFile(path, file);
  });

  await resolve(promises, { concurrency: 100 });
  return promises.length;
}

if (require.main === module) main();
else module.exports = main;