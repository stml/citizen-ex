safari.application.addEventListener('navigate', function(stuff) {
  // make a new entry
  utils.createLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);

safari.application.addEventListener('activate', function(stuff) {
  // update timestamp
  utils.updateLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);
