// Define and set up Chrome utils

var ChromeUtils = function() {};

ChromeUtils.prototype.getTabById = function(tabId, callback) {
  // we use a callback here because chrome.tabs.get is asynchronous
  chrome.tabs.get(tabId, function(tab){
    callback(tab.url);
  });
};

var chromeUtils = new ChromeUtils();
