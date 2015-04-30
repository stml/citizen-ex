// page/js/init_safari.js

safari.self.addEventListener('message', function(message) {

  if (message.name === 'tabs') {
    cxPage.receiveOpenTabs(message.message.tabs);
  } else if (message.name === 'activeTab') {
    cxPage.receiveActiveTab(message.message.activeTab);
  } else if (message.name === 'allLogEntries') {
    cxPage.receiveAllLogEntries(message.message.allLogEntries);
  } else if (message.name === 'countryLog') {
    cxPage.receiveCitizenship(message.message.countryLog);
  } else if (message.name === 'ownGeoData') {
    cxPage.receiveOwnGeoData(message.message.ownGeoData);
  }


}, false);

cxPage.requestOpenTabs();
