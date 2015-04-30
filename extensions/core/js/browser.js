var CxBrowser = function() {
  this.name = 'unknown';
  var notChrome = _.isUndefined(window.chrome);
  if (!notChrome) {
    this.name = 'chrome';
  } else {
    this.name = 'safari';
  }
};

CxBrowser.prototype.chrome = function() {
  return this.name === 'chrome';
};

CxBrowser.prototype.safari = function() {
  return this.name === 'safari';
};
