const mkdirp = require("mkdirp");

module.exports = function mkdirpPromise(path) {
  return new Promise((resolve, reject) =>
    mkdirp(dir, (error) => error ? reject(error) : resolve())
  );
}
