import { OUTPUT_DIR } from "../constants";
import { download } from "../util";

import { extname, basename, resolve } from "path";
import { existsSync } from "fs";
import { tokenizer } from "acorn";
import { mkdir } from "fs/promises";
import mimeTypes from "mime-types";

const validExtensions = new Set(Object.keys(mimeTypes.types));
const hashRegex = /^[a-zA-Z0-9]{32}$/;

const dir = resolve(OUTPUT_DIR, "cdn");

export default async function Cdn(file: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  for (const { type, value } of tokenizer(file, {
    ecmaVersion: "latest"
  })) {
    if (type.label !== "string") continue;

    const ext = extname(value);
    if (!ext || !validExtensions.has(ext.slice(1))) continue;

    const name = basename(value, ext);
    if (!hashRegex.test(name)) continue;

    const url = "/assets/" + value;
    download(url, "cdn", value);
  }
}