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
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(key, message);
  } else if (this.browser.firefox()) {
    if (globalWorker) {
      globalWorker.port.emit(key, message);
    }
  } else {
    throw 'Unknown browser';
  }
};

