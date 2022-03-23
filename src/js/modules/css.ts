import { OUTPUT_DIR } from "../constants";
import { download } from "../util";

import { mkdir, writeFile } from "fs/promises";
import { extname, resolve } from "path";
import { walk, parse } from "css-tree";
import { existsSync } from "fs";
import mimeTypes from "mime-types";
import parseURI from "data-urls";

const dir = resolve(OUTPUT_DIR, "css");

export default async function Css(file: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  let ignore = false;
  let parent: string;

  walk(parse(file), node => {
    switch (node.type) {
      case "ClassSelector":
        parent = node.name.replace(/-\w+$/, "");
        break;

      case "Declaration":
        ignore = node.property.startsWith("-webkit");
        break;

      case "Url":
        if (ignore || !parent) break;
        switch (node.value.type) {
          case "String":
            const uri = parseURI(node.value.value.slice(1, -1));
            writeFile(
              resolve(
                dir,
                parent + "." + mimeTypes.extension(uri.mimeType.toString())
              ),
              uri.body
            );
            break;

          case "Raw":
            if (node.value.value.startsWith("#")) return;
            download(
              node.value.value,
              "css",
              parent + extname(node.value.value)
            );
            break;

          default:
            return;
        }
        break;
    }
  });
}