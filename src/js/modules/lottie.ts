import { OUTPUT_DIR } from "../constants";
import { renderLottie } from "../util";

import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { tokenizer } from "acorn";
import { resolve } from "path";

const dir = resolve(OUTPUT_DIR, "lottie");

export default async function Lottie(file: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  for (const { type, value } of tokenizer(file, {
    ecmaVersion: "latest"
  })) {
    if (
      type.label !== "string" ||
      !value.startsWith("{") ||
      !value.endsWith("}")
    )
      continue;

    let asset;
    try {
      asset = JSON.parse(value);
    } catch {
      continue;
    }

    if (
      !asset.v || // version
      !asset.fr || // frameRate
      !asset.w || // width
      !asset.h || // height
      !asset.nm // name
    )
      continue;

    console.log(asset.nm);
    const inputPath = resolve(OUTPUT_DIR, "lottie", asset.nm + ".json");
    const outputPath = resolve(OUTPUT_DIR, "lottie", asset.nm + ".gif");
    await writeFile(inputPath, value);
    renderLottie(inputPath, outputPath);
  }
}