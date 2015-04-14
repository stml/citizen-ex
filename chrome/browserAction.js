chrome.storage.local.get('logEntries', function(entries) {
  var logEntries = entries.logEntries;
  var lastEntry = logEntries[logEntries.length - 1];
  var logString = JSON.stringify(lastEntry);
  console.log(logString);
});
