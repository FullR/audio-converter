const {exec} = require("child_process");

module.exports = function run(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if(error) {
        reject(error);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}
