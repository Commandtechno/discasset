const { output, verbose } = require("../config");
const download = require("../download").CSS;
const base = require("../constants").assets;

const { writeFile } = require("fs/promises");
const { extension } = require("mime-types");
const { extname } = require("path");
const parseURI = require("data-urls");
const robert = require("robert");
const tree = require("css-tree");

async function main() {
  const resolve = (await import("p-all")).default;
  const file = await download();

  console.log("Parsing CSS");
  const css = tree.parse(file);
  const assets = [];

  let parent;
  let ignore;

  console.log("Downloading assets");
  tree.walk(css, ({ type, name, value, property }) => {
    switch (type) {
      case "ClassSelector":
        parent = name.replace(/-\w+$/, "");
        break;
      case "Declaration":
        ignore = property.startsWith("-webkit-");
        break;
      case "Url":
        if (ignore) break;
        value.name = parent;
        assets.push(value);
        break;
    }
  });

  const promises = assets.map(({ type, name, value }) => async () => {
    let path = output + "/css/" + name + ".";
    let data;
    switch (type) {
      case "String":
        const uri = parseURI(value.slice(1, -1));
        path += extension(uri.mimeType.toString());
        data = uri.body;
        break;
      case "Raw":
        const url = new URL(value, base).toString();
        path += extname(url);

        if (verbose) console.log("Fetching " + url);
        data = await robert.get(url).send("buffer");
        break;
    }

    if (verbose) console.log("Writing " + path);
    await writeFile(path, data);
  });

  await resolve(promises, { concurrency: 100 });
  return promises.length;
}

if (require.main === module) main();
else module.exports = main;