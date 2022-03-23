import { BASE_URL, OUTPUT_DIR } from "./constants";

import { resolve } from "path";
import { spawn } from "child_process";

const child = spawn(resolve(__dirname, "..", "go", "discasset"));
child.stdout.pipe(process.stdout);

export function send(...args: string[]) {
  child.stdin.write(args.join(";"));
  child.stdin.write("\n");
}

export function download(url: string, ...path: string[]) {
  send(
    "DOWNLOAD",
    new URL(url, BASE_URL).toString(),
    resolve(OUTPUT_DIR, ...path)
  );
}

export function renderLottie(inputPath: string, outputPath: string) {
  send("RENDER_LOTTIE", inputPath, outputPath);
}

export function exit() {
  send("EXIT");
}