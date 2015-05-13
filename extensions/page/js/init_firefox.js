// page/js/init_firefox.js

self.port.on('allLogEntries', function(message) {
  cxPage.receiveAllLogEntries(message);
});

self.port.on('countryLog', function(message) {
  cxPage.receiveCitizenship(message);
});
