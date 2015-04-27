// templates/js/init_safari.js

var sidebar = false;

safari.self.addEventListener('message', function(message) {

  if (message.name === 'tabs') {
    sidebar.updateTabs(message.message.tabs);
  } else if (message.name === 'activeTab') {
    sidebar.receiveActiveTab(message.message.activeTab);
  } else if (message.name === 'allLogEntries') {
    sidebar.receiveAllLogEntries(message.message.allLogEntries);
  } else if (message.name === 'countryLog') {
    sidebar.receiveCitizenship(message.message.countryLog);
  } else if (message.name === 'ownGeoData') {
    sidebar.receiveOwnGeoData(message.message.ownGeoData);
  }

  if (sidebar) {
    return;
  }

  sidebar = new Sidebar(panes, browser);
  _.each(panes, function(pane) {
    new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
  });

  // we fetch the last record again
  // as some of its request should have come back by now
  sidebar.getLogEntryForTab();

  // we toggle the main sidebar pane visibility
  if (message.name === 'openSidebar') {
    sidebar.toggle();
    sidebar.requestOpenTabs();
  }

}, false);
