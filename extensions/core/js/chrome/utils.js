// Define and set up Chrome utils

var ChromeUtils = function() {};

ChromeUtils.prototype.getTabById = function(tabId, callback) {
  // we use a callback here because chrome.tabs.get is asynchronous
  chrome.tabs.get(tabId, callback);
};

ChromeUtils.prototype.findEntryForTab = function(tab) {
  return _.find(logEntries, function(entry) {
    return (tab.url === entry.url && tab.id === entry.tabId && tab.windowId === entry.windowId);
  });
};

var chromeUtils = new ChromeUtils();
