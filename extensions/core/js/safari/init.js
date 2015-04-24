safari.application.addEventListener('navigate', function(stuff) {
  console.log(safari.application.activeBrowserWindow.activeTab);
  utils.createLogEntry(safari.application.activeBrowserWindow.activeTab);
}, true);

safari.application.addEventListener('navigate', function(stuff) {
  console.log(safari.application.activeBrowserWindow.activeTab);
  utils.createLogEntry(safari.application.activeBrowserWindow.activeTab);
}, true);
