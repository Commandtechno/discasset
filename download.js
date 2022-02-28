const { htmlUrl, baseUrl } = require("./constants");
const { verbose } = require("./config");

const { ancestor } = require("acorn-walk");
const { parse } = require("acorn");
const { load } = require("cheerio");
const robert = require("robert").default;
const chalk = require("chalk");

const prefix = "[" + chalk.bgBlue(chalk.black(" DOWNLOAD ")) + "]";
const cache = {};
const jsUrls = new Set();

let html;
let cssUrl;

async function fetch(path) {
  const url = new URL(path, baseUrl).toString();
  if (cache[url]) return cache[url];

  if (verbose) console.log(prefix, chalk.blue("Fetching"), url);
  const res = await robert.get(url).send("text");
  if (verbose) console.log(prefix, chalk.green("Fetched"), url);

  cache[url] = res;
  return res;
}

async function HTML() {
  if (html) return html;

  html = load(await fetch(htmlUrl));
  cssUrl = html('link[rel="stylesheet"]').first().attr("href");

  const scripts = html("script").filter(
    (_, script) => script.attribs.src && !script.attribs.src.startsWith("/cdn-cgi")
  );

  for (const script of scripts) jsUrls.add(script.attribs.src);
  const firstUrl = scripts.first().attr("src");
  const first = await fetch(firstUrl);

  ancestor(parse(first), {
    Literal(node, ancestors) {
      if (node.value !== ".js") return;

      const parent = ancestors[ancestors.length - 2];
      if (parent?.type !== "BinaryExpression" || parent.operator !== "+") return;

      const { left } = parent;
      if (left?.type !== "MemberExpression") return;

      const { object } = left;
      if (object?.type !== "ObjectExpression") return;

      const { properties } = object;
      for (const property of properties) jsUrls.add("/assets/" + property.value.value + ".js");
    }
  });

  return html;
}

async function CSS() {
  if (!cssUrl) await HTML();
  css = await fetch(cssUrl);
  return css;
}

async function JS() {
  if (!jsUrls.size) await HTML();

  const files = [];
  for (const jsUrl of jsUrls) {
    const file = fetch(jsUrl);
    files.push(file);
  }

  return files;
}

module.exports = {
  HTML,
  CSS,
  JS
};