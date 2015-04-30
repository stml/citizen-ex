// we fetch the last record again
// as some of its request should have come back by now
cxPanel.requestActiveTab();

// we toggle the main sidebar pane visibility
cxPanel.toggle();
cxPanel.requestOpenTabs();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tabs) {
    cxPanel.receiveOpenTabs(request.tabs);
  }
});
