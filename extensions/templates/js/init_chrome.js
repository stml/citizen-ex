// templates/js/init_chrome.js

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (_.has(request, 'tabs')) {
    sidebar.updateTabs(request.tabs);
  } else if (_.has(request, 'activeTab'))  {
    sidebar.receiveActiveTab(request.activeTab);
  } else if (request.allLogEntries) {
    sidebar.receiveAllLogEntries(request.allLogEntries);
  } else if (request.countryLog) {
    sidebar.receiveCitizenship(request.countryLog);
  } else if (_.has(request, 'ownGeoData')) {
    sidebar.receiveOwnGeoData(request.ownGeoData);
  }
});

sidebar = new Sidebar(panes, browser);
_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});
