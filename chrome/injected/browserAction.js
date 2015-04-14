chrome.storage.local.get('logEntries', function(entries) {
  var logEntries = entries.logEntries;
  var lastEntry = logEntries[logEntries.length - 1];
  var logString = JSON.stringify(lastEntry);
  sidebar.set({ lastLogEntry: lastEntry });
  sidebar.set({ activePane: sidebar.panes[0] })
});
