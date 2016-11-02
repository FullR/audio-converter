const chunk = require("lodash.chunk");
const asyncSeries = require("./async-series");

module.exports = function asyncChunkSeries(arr, chunkSize, fn) {
  if(chunkSize >= arr.length) return asyncSeries(arr, fn);
  return asyncSeries(chunk(arr, chunkSize), (chunk) => Promise.all(chunk.map(fn)));
}
