
// Run fn on each element of arr asynchronously but in series
module.exports = function asyncSeries(arr, fn) {
  return arr.reduce((promise, value) => {
    return promise.then(() => fn(value));
  }, Promise.resolve());
}
