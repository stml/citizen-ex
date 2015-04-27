var CxStorage = function(browser) {
  this.browser = browser;
};

CxStorage.prototype.set = function(property, value) {
  if (!property) {
    return;
  }

  var json = JSON.prune(value);
  if (this.browser.chrome()) {
    chrome.storage.local.set({ property: json });
  } else if (this.browser.safari()) {
    localStorage[property] = json;
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.get = function(property, callback) {
  if (this.browser.chrome()) {
    chrome.storage.local.get(property, function(result) {
      callback(JSON.parse(result));
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
