var CxStorage = function(browser) {
  this.browser = browser;
};

CxStorage.prototype.set = function(property, value) {
  if (!property) {
    return;
  }

  var json = JSON.prune(value);
  if (this.browser.chrome()) {
    var obj = {};
    obj[property] = json;
    chrome.storage.local.set(obj);
  } else if (this.browser.safari()) {
    localStorage[property] = json;
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.get = function(property, callback) {
  if (this.browser.chrome()) {
    chrome.storage.local.get(property, function(result) {
      var data = undefined;
      if (result[property]) {
        data = JSON.parse(result[property]);
        callback(data);
      }
    });
  } else if (this.browser.safari()) {
    var data = undefined;
    if (localStorage[property]) {
      var data = JSON.parse(localStorage[property]);
    }
    callback(data);
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.clear = function() {
  if (this.browser.chrome()) {
    chrome.storage.local.clear();
  } else if (this.browser.safari()) {
    localStorage.clear();
  } else {
    throw 'Unknown browser';
  }
};
