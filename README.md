![Discasset Banner](https://cdn.discordapp.com/attachments/415951527258095616/815901327681912882/discasset.banner.png)

fuck assets, get bitches.

Run `node download` to download the required data, then use
`node extract-css`, `node extract-cdn-assets`, `node extract-svg` and `node extract-svg2` to process the data files.

*or alternatively use launch.bat on windows to run all of them.*

the svg converter isn't perfect but should work for most assets.
**yes, the `extract-svg` converter will tell you that ~10-20 assets could not be converted**, im too lazy to fix the regex/make it work better. if there is a significant amount of assets not converted you can use `-debug` to log all conversion errors to the console.

file names for `out.svg` might not match up properly because i am quite frankly too lazy to make it work properly

rendering for `extract-lottie` may take a bit during the initial render - converting lottie to gif sucks ass and is slow
