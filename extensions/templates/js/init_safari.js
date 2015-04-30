// templates/js/init_safari.js

var cxPanel = false;

safari.self.addEventListener('message', function(message) {

  if (message.name === 'tabs') {
    cxPanel.receiveOpenTabs(message.message.tabs);
  } else if (message.name === 'activeTab') {
    cxPanel.receiveActiveTab(message.message.activeTab);
  } else if (message.name === 'allLogEntries') {
    cxPanel.receiveAllLogEntries(message.message.allLogEntries);
  } else if (message.name === 'countryLog') {
    cxPanel.receiveCitizenship(message.message.countryLog);
  } else if (message.name === 'ownGeoData') {
    cxPanel.receiveOwnGeoData(message.message.ownGeoData);
  }

  if (cxPanel) {
    return;
  }

  cxPanel = new CxPanel(browser);
  cxPanelView = new CxPanelView({ model: cxPanel, template: paneTemplate });

  // we fetch the last record again
  // as some of its request should have come back by now
  cxPanel.requestActiveTab();

  // we toggle the main cxPane pane visibility
  if (message.name === 'openCxPanel') {
    cxPanel.toggle();
    cxPanel.requestOpenTabs();
  }

}, false);
