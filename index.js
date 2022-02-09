require("./init");

const cdn = require("./modules/cdn");
const css = require("./modules/css");
const lottie = require("./modules/lottie");
// const svg = require("./modules/svg");

async function main() {
  // await cdn();
  // await css();
  await lottie();
  return;
}

main();