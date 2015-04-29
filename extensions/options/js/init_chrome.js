// options/js/init_chrome.js

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tabs) {
    options.updateTabs(request.tabs);
  } else if (request.lastTab)  {
    if (request.lastTab === null) {
      return;
    }
    options.receiveLastTab(request.lastTab);
  } else if (request.allLogEntries) {
    if (request.allLogEntries === true) {
      return;
    }
    options.receiveAllLogEntries(request.allLogEntries);
  } else if (request.countryLog) {
    if (request.countryLog === true) {
      return;
    }
    options.receiveCitizenship(request.countryLog);
  } else if (request.ownGeoData) {
    options.receiveOwnGeoData(request.ownGeoData);
  }
});


