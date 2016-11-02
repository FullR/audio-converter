const path = require("path");
const co = require("co");
const glob = require("glob-promise");
const uniq = require("lodash.uniq");
const mkdirp = require("./util/mkdirp-promise");
const run = require("./util/run");
const asyncChunkSeries = require("./util/async-chunk-series");
const wavExtRegexp = /\.wav$/;

function noop() {}

const convertDirectory = co.wrap(function* (inputDirectory, outputDirectory, {maxProcessCount=300, format="mp3", onProgress, log, compression}={}) {
  onProgress = onProgress || noop;
  log("Discovering WAVs");
  const wavFiles = yield glob(path.join(inputDirectory, "**", "*.wav"));
  log(`${wavFiles.length} discovered`);
  const pairs = wavFiles.map((inputPath) => ({
    inputPath,
    outputPath: inputPath.replace(inputDirectory, outputDirectory).replace(wavExtRegexp, `.${format}`)
  }));
  let total = pairs.length;
  let complete = 0;

  const directories = uniq(pairs.map(({outputPath}) => path.dirname(outputPath)));

  log("Creating directory structure");
  yield asyncChunkSeries(directories, maxProcessCount, (dir) => mkdirp(dir));

  log("Converting files");
  onProgress({complete: 0, total: pairs.length});
  yield asyncChunkSeries(pairs, maxProcessCount, ({inputPath, outputPath}) => {
    log(`${inputPath} -> ${outputPath}`);
    return convertFile(inputPath, outputPath)
      .then(() => onProgress({total, complete: ++complete}));
  });
});

function convertFile(inputPath, outputPath, {compression}={}) {
  return run(`sox "${inputPath}" ${compression ? `-C${compression}` : ""} "${outputPath}"`);
}

convertFile.convertDirectory = convertDirectory;

module.exports = convertFile;
