import Cdn from "./modules/cdn";
import Css from "./modules/css";
import Lottie from "./modules/lottie";

import { BASE_URL } from "./constants";

import { Node, parse } from "acorn";
import { ancestor } from "acorn-walk";
import { load } from "cheerio";
import robert from "robert";

function fetch(url: string | URL) {
  return robert(new URL(url, BASE_URL)).send("text");
}

async function discasset() {
  const html = load(await fetch("/login"));

  const cssUrl = html('link[rel="stylesheet"]').first().attr("href");
  const css = await fetch(cssUrl);

  const jsUrls = new Set<string>();
  const scripts = html("script").filter(
    (_, script) =>
      script.attribs.src && script.attribs.src.startsWith("/assets")
  );

  for (const script of scripts) {
    jsUrls.add(script.attribs.src);
  }

  const firstJsUrl = scripts.first().attr("src");
  const firstJs = parse(await fetch(firstJsUrl), { ecmaVersion: "latest" });

  ancestor(firstJs, {
    Literal(node, ancestors: Node[]) {
      // @ts-ignore
      if (node.value !== ".js") return;

      const parent = ancestors[ancestors.length - 2];
      // @ts-ignore
      if (parent?.type !== "BinaryExpression" || parent.operator !== "+")
        return;

      // @ts-ignore
      const { left } = parent;
      if (left?.type !== "MemberExpression") return;

      const { object } = left;
      if (object?.type !== "ObjectExpression") return;

      const { properties } = object;
      for (const property of properties)
        jsUrls.add("/assets/" + property.value.value + ".js");
    }
  });

  // await Css(css);
  console.log(jsUrls.size);
  for (const jsUrl of jsUrls) {
    // await Cdn(js);
    setImmediate(async () => {
      const js = await fetch(jsUrl);
      Lottie(js);
    });
  }
}

discasset();