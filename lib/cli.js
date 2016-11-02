const {version} = require("../package");
const path = require("path");
const {lstatSync} = require("fs");
const mkdirp = require("./util/mkdirp-promise");
const audioConverter = require("./audio-converter");
const pace = require("pace");
const program = require("commander");

program
  .version(version)
  .usage("[options] <File or Directory> <output>")
  .option("-p, --progress", "Display a progress bar")
  .option("-c, --processCount <n>", "The maximum number of parallel processes to use while converting (default: 300)", parseInt, 300)
  .option("-v, --verbose", "Print verbose logs")
  .option("-f, --format <format>", "The audio format to convert into (mp3/ogg, default: mp3)", /^(mp3|ogg)$/, "mp3")
  .option("-C, --compression <n>", "Compression value to use when converting")
  .parse(process.argv);


if(program.args < 2) {
  program.outputHelp();
  process.exit(1);
}

const {progress, processCount, format, compression, verbose} = program;
const inputPath = path.resolve(program.args[0]);
const outputPath = path.resolve(program.args[0]);
const log = verbose ? console.log.bind(console) : function(){};

let progressBar;

function onProgress({total, complete}) {
  if(!progressBar) progressBar = pace(total);
  else {
    progressBar.op(complete);
  }
}


if(lstatSync(inputPath).isDirectory()) {
  audioConverter.convertDirectory(inputPath, outputPath, {
    format, compression,
    maxProcessCount: processCount,
    onProgress: progress ? onProgress : null,
    log: verbose ? console.log.bind(console) : null
  }).catch((e) => console.log(e));
} else {
  const outputPathWithName = path.join(outputPath, path.basename(inputPath, ".wav") + "." + format);
  log("Converting single file", inputPath, outputPathWithName);
  mkdirp(outputPath).then(() =>
    audioConverter.convertFile(inputPath, outputPathWithName, {compression})
  );
}
