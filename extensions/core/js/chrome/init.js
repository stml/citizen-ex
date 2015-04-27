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
  var senderObject = sender;
  if (_.has(request, 'activeTab')) {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      chrome.tabs.sendMessage(senderObject.tab.id, { activeTab: tabs[0].url });
    });
  } else if (_.has(request, 'allTabs')) {
    var windowId = sender.tab.windowId;

    chrome.tabs.query({ windowId: windowId }, function(tabs) {
      var urls = _.pluck(tabs, 'url');

      chrome.tabs.sendMessage(senderObject.tab.id, { tabs: urls });
    });
  } else if (_.has(request, 'allLogEntries')) {
    chrome.tabs.sendMessage(senderObject.tab.id, { allLogEntries: logEntries });
  } else if (_.has(request, 'countryLog')) {
    chrome.tabs.sendMessage(senderObject.tab.id, { countryLog: countryLog });
  } else if (_.has(request, 'ownGeoData')) {
    chrome.tabs.sendMessage(senderObject.tab.id, { ownGeoData: geoCache.getOwnLocation() });
  }
});
