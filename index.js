require("./init");

const cdn = require("./modules/cdn");
const css = require("./modules/css");
const lottie = require("./modules/lottie");
// const svg = require("./modules/svg");

const args = process.argv.slice(2);

async function main() {
  if (!args.length || args.includes("cdn")) await cdn();
  if (!args.length || args.includes("css")) await css();
  if (!args.length || args.includes("lottie")) await lottie();
}

main();