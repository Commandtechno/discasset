const { url, base, jsRegex } = require("./constants");

const { parse } = require("@babel/parser");
const { load } = require("cheerio");
const traverse = require("@babel/traverse").default;
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
  HTML,
  CSS,
  JS
};