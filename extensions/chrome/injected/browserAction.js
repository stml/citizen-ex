// we fetch the last record again
// as some of its request should have come back by now
sidebar.getLogEntryForTab();

// we toggle the main sidebar pane visibility
sidebar.toggle();
sidebar.requestOpenTabs();

