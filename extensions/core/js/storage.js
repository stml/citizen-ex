var Storage = function(browser) {
  this.browser = browser;
};

Storage.prototype.set = function(property, value) {
  if (this.browser.chrome()) {
    chrome.storage.local.set({ property: value });
  } else if (this.browser.safari()) {
    localStorage[property] = value;
  } else {
    throw 'Unknown browser';
  }
};

Storage.prototype.get = function(property, callback) {
  if (this.browser.chrome()) {
    chrome.storage.local.get(property, callback);
  } else if (this.browser.safari()) {
    callback(localStorage[property]);
  } else {
    throw 'Unknown browser';
  }
};

Storage.prototype.clear = function() {
  if (this.browser.chrome()) {
    chrome.storage.local.clear();
  } else if (this.browser.safari()) {
    localStorage.clear();
  } else {
    throw 'Unknown browser';
  }
};
