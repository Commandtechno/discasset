const { url, base } = require("./constants");

const { rm, writeFile } = require("fs/promises");
const { existsSync } = require("fs");
const { parse } = require("@babel/parser");
const { load } = require("cheerio");
const traverse = require("@babel/traverse").default;
const extract = require("extract-zip");
const robert = require("robert");

const cache = {};
let cssURL;
let jsURLs = new Set();

async function fetch(path) {
  const url = new URL(path, base);
  if (cache[url]) return cache[url];
  const res = await robert.get(url).send("text");
  cache[url] = res;
  return res;
}

async function GIFSKI() {
  try {
    spawnSync("gifski");
    return;
  } catch {}

  process.env.GIFSKI_PATH = __dirname + "/gifski/";
  switch (process.platform) {
    case "win32":
      process.env.GIFSKI_PATH += "win/gifski.exe";
      break;
    case "darwin":
      process.env.GIFSKI_PATH += "mac/gifski";
      break;
    case "linux":
      process.env.GIFSKI_PATH += "debian/gifski";
      break;
    default:
      console.log("Gifski not supported on platform: " + process.platform);
      process.exit();
  }

  if (!existsSync(process.env.GIFSKI_PATH)) {
    console.log("Downloading Gifski");
    const file = await robert.get("https://gif.ski/gifski-1.5.0.zip").send("buffer");
    await writeFile("gifski.zip", file);
    await extract("gifski.zip", { dir: __dirname + "/gifski" });
    await rm("gifski.zip");
  }
}

async function HTML() {
  html = await fetch(url);

  const scripts = load(html)("script").filter((_, script) => script.attribs.src);
  const firstURL = scripts.first().attr("src");
  const lastURL = scripts.last().attr("src");

  jsURLs.add(firstURL);
  jsURLs.add(lastURL);
  const first = await fetch(firstURL);

  traverse(parse(first), {
    enter({ node, parent }) {
      if (node.type !== "StringLiteral" || node.value !== ".js") return;
      if (parent?.type !== "BinaryExpression" || parent.operator !== "+") return;

      const { left } = parent;
      if (left?.type !== "MemberExpression") return;

      const { object } = left;
      if (object?.type !== "ObjectExpression") return;

      const { properties } = object;
      if (!properties?.length) return;

      properties.forEach(({ value }) => jsURLs.add("/assets/" + value.value + ".js"));
    }
  });

  cssURL = load(html)("link").first().attr("href");
  return html;
}

async function CSS() {
  if (!cssURL) await HTML();
  css = await fetch(cssURL);
  return css;
}

async function* JS() {
  if (!jsURLs.size) await HTML();
  for (const jsURL of jsURLs) yield fetch(jsURL);
}

module.exports = {
  GIFSKI,
  HTML,
  CSS,
  JS
};

GIFSKI();