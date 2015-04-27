var CxMessage = function(browser) {
  this.browser = browser;
};

CxMessage.prototype.send = function(message, callback) {
  if (this.browser.chrome()) {
    chrome.runtime.sendMessage(message, callback);
  } else if (this.browser.safari()) {
    // safari
  } else {
    throw 'Unknown browser';
  }
};

