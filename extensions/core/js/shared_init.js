var browser = new CxBrowser();
var storage = new CxStorage(browser);
var icon = new CxIcon(browser, 'icon16-blank.png', 'icon16-local.png', 'icon16-remote.png', 'icon16.png');
var utils = new Utils(browser);
var geoCache = new GeoCache(browser);
var countryLog = new CountryLog(browser);
var logEntries = [];

// Fetch the stored log entries on load, so we can keep adding to them

storage.get('logEntries', function(entries) {
  if (entries) {
    logEntries = _.map(entries, function(entry) {
      var logEntry = new LogEntry();
      logEntry.fromJSON(entry);
      return logEntry;
    });

    console.log('Fetched the stored log entries');
  }
});
