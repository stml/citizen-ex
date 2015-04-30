// templates/js/init_chrome.js

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (_.has(request, 'tabs')) {
    cxPanel.receiveOpenTabs(request.tabs);
  } else if (_.has(request, 'activeTab'))  {
    cxPanel.receiveActiveTab(request.activeTab);
  } else if (request.allLogEntries) {
    cxPanel.receiveAllLogEntries(request.allLogEntries);
  } else if (request.countryLog) {
    cxPanel.receiveCitizenship(request.countryLog);
  } else if (_.has(request, 'ownGeoData')) {
    cxPanel.receiveOwnGeoData(request.ownGeoData);
  }
});

cxPanel = new CxPanel(browser);
cxPanelView = new CxPanelView({ model: cxPanel, template: paneTemplate });
