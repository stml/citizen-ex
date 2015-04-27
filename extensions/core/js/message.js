var CxMessage = function(browser) {
  this.browser = browser;
};

CxMessage.prototype.send = function(message) {
  if (this.browser.chrome()) {
    chrome.runtime.sendMessage(message);
  } else if (this.browser.safari()) {

    var key;

    _.each(message, function (v, k) {
      if (v) {
        key = k;
      }
    });
    safari.self.tab.dispatchMessage(key, message, false);
  } else {
    throw 'Unknown browser';
  }
};

