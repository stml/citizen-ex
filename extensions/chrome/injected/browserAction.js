// we fetch the last record again
// as some of its request should have come back by now
sidebar.getLogEntryForTab();

// we toggle the main sidebar pane visibility
sidebar.toggle();
sidebar.requestOpenTabs();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tabs) {
    sidebar.updateTabs(request.tabs);
  }
});

cex_load_map();
