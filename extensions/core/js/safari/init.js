// core/js/safari/safari/init.js

safari.application.addEventListener('navigate', function(stuff) {
  // make a new entry
  utils.createLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);

safari.application.addEventListener('activate', function(stuff) {
  // update timestamp
  utils.updateLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);

safari.application.addEventListener('command', function(stuff) {
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('openSidebar');
}, false);

safari.application.addEventListener('message', function(message) {
  var name = message.name;
  if (name === 'activeTab') {
    var activeTab = safari.application.activeBrowserWindow.activeTab;
    message.target.page.dispatchMessage(name, { activeTab: activeTab.url }, false)

  } else if (name === 'allTabs') {
    var tabs = safari.application.activeBrowserWindow.tabs;
    var urls = _.pluch(tabs, 'url');
    message.target.page.dispatchMessage(name, { tabs: urls }, false)

  } else if (name === 'allLogEntries') {
    message.target.page.dispatchMessage(name, { allLogEntries: logEntries }, false)
  } else if (name === 'countryLog') {
    message.target.page.dispatchMessage(name, { countryLog: countryLog }, false)
  } else if (name === 'ownGeoData') {
    message.target.page.dispatchMessage(name, { ownGeoData: geoCache.getOwnLocation() }, false)
  }
}, false);

