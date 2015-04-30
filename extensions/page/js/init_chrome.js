// options/js/init_chrome.js

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tabs) {
    cxPage.receiveOpenTabs(request.tabs);
  } else if (request.lastTab)  {
    if (request.lastTab === null) {
      return;
    }
    cxPage.receiveLastTab(request.lastTab);
  } else if (request.allLogEntries) {
    if (request.allLogEntries === true) {
      return;
    }
    cxPage.receiveAllLogEntries(request.allLogEntries);
  } else if (request.countryLog) {
    if (request.countryLog === true) {
      return;
    }
    cxPage.receiveCitizenship(request.countryLog);
  } else if (request.ownGeoData) {
    cxPage.receiveOwnGeoData(request.ownGeoData);
  }
});


