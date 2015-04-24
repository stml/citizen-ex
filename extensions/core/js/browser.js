var Browser = function() {
  this.name = 'unknown';
  var notChrome = _.isUndefined(window.chrome);
  if (!notChrome) {
    this.name = 'chrome';
  } else {
    this.name = 'safari';
  }
};

Browser.prototype.chrome = function() {
  return this.name === 'chrome';
};

Browser.prototype.safari = function() {
  return this.name === 'safari';
};
