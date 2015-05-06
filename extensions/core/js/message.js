var CxMessage = function(browser) {
  this.browser = browser;
};

CxMessage.prototype.send = function(message) {
  var key;

  _.each(message, function (v, k) {
    if (v) {
      key = k;
    }
  });

  if (this.browser.chrome()) {
    chrome.runtime.sendMessage(message);
  } else if (this.browser.safari()) {

    safari.self.tab.dispatchMessage(key, message, false);

  } else if (this.browser.firefox()) {
    self.port.emit(key, message);
    console.log('emitting a message');
  } else {
    throw 'Unknown browser';
  }
};

