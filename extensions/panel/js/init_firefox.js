// panel/js/init_firefox.js

cxPanel = new CxPanel(browser);
cxPanelView = new CxPanelView({ model: cxPanel, template: panelTemplate });

self.port.on('activeTab', function(message) {
  cxPanel.receiveActiveTab(message);
});

self.port.on('tabs', function(message) {
  cxPanel.receiveOpenTabs(message);
});

self.port.on('allLogEntries', function(message) {
  cxPanel.receiveAllLogEntries(message);
});

self.port.on('countryLog', function(message) {
  cxPanel.receiveCitizenship(message);
});

self.port.on('ownGeoData', function(message) {
  cxPanel.receiveOwnGeoData(message);
});


cxPanel.toggle();
