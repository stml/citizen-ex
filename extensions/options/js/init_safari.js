safari.self.addEventListener('message', function(message) {

  console.log(message);

  if (message.name === 'tabs') {
    options.updateTabs(message.message.tabs);
  } else if (message.name === 'activeTab') {
    options.receiveActiveTab(message.message.activeTab);
  } else if (message.name === 'allLogEntries') {
    options.receiveAllLogEntries(message.message.allLogEntries);
  } else if (message.name === 'countryLog') {
    options.receiveCitizenship(message.message.countryLog);
  } else if (message.name === 'ownGeoData') {
    options.receiveOwnGeoData(message.message.ownGeoData);
  }


}, false);

options.requestOpenTabs();
