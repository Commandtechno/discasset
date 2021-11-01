const cdn = require("./modules/cdn");
const css = require("./modules/css");
const lottie = require("./modules/lottie");
// const svg = require("./modules/svg");

const chalk = require("chalk");

async function main() {
  console.clear();

  console.log();
  console.log(chalk.bold("Extracting from CDN"));
  console.time("cdn");
  const cdnCount = await cdn();
  console.timeEnd("cdn");
  console.log(chalk.bold("Extracted " + chalk.blue(cdnCount) + " from CDN"));

  console.log();
  console.log(chalk.bold("Extracting from CSS"));
  console.time("css");
  const cssCount = await css();
  console.timeEnd("css");
  console.log(chalk.bold("Extracted " + chalk.blue(cssCount) + " from CSS"));

  console.log();
  console.log(chalk.bold("Extracting lottie"));
  console.time("lottie");
  const lottieCount = await lottie();
  console.timeEnd("lottie");
  console.log(chalk.bold("Extracted " + chalk.blue(lottieCount) + " from lottie"));

  console.log("Will extract SVG once techno gets enough sleep");
}

main();