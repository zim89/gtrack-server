const runValidateAtUpdate = function (next) {
  this.options.runValidators = true;
  next();
};

module.exports = runValidateAtUpdate;
