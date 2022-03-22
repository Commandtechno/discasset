const constants = require("../constants");

const { extname, basename } = require("path");
const { tokenizer } = require("acorn");
const mime = require("mime-types");

const extensions = new Set(Object.keys(mime.types));

export default function cdn(file: string) {
  const assets = new Set<string>();
  for (const { type, value } of tokenizer(file, {
    ecmaVersion: "latest"
  })) {
    if (type.label !== "string") continue;

    const ext = extname(value);
    if (!ext || !extensions.has(ext.slice(1))) continue;

    const name = basename(value, ext);
    if (!constants.regex.test(name)) continue;

    assets.add(value);
  }

  return assets;
}