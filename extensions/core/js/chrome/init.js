// Respond to events

chrome.tabs.onUpdated.addListener(function(tabId) {
  // create a new entry
  chromeUtils.getTabById(tabId, function(tabUrl) {
    utils.createLogEntry(tabUrl);
  });
});

// fires when an existing tab is selected
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // update timestamp
  var tabId = activeInfo.tabId;
  chromeUtils.getTabById(tabId, function(tabUrl) {
    utils.updateLogEntry(tabUrl);
  });
});

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, { file: 'injected/browserAction.js' });
});

chrome.storage.onChanged.addListener(function(data) {
  if (data.logEntries || data.geoCache) {
    if (_.has(data.logEntries, 'newValue') || _.has(data.geoCache, 'newValue')) {
      return;
    }

    // if there are no values then it means we want to clear all history
    utils.reset();
  }
});

// we have to use Chrome’s messaging system because the page can’t find out its own tabId
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.activeTab) {
    sendResponse(sender.tab);
  } else if (request.allTabs) {
    var windowId = sender.tab.windowId;
    var senderObject = sender;

    // this has to use message sending back and forth
    // simple value sending to a callback fails
    chrome.tabs.query({ windowId: windowId }, function(tabs) {
      chrome.tabs.sendMessage(senderObject.tab.id, { tabs: tabs });
    });
  } else if (request.allLogEntries) {
    sendResponse(logEntries);
  } else if (request.countryLog) {
    sendResponse(countryLog);
  }
});
