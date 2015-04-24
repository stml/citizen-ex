var browser = new Browser();
var storage = new CxStorage(browser);
var utils = new Utils(browser);
var geoCache = new GeoCache(browser);
var countryLog = new CountryLog(browser);
var logEntries = [];

// Fetch the stored log entries on load, so we can keep adding to them

storage.get('logEntries', function(entries) {
  if (entries && entries.logEntries) {
    var entries = entries.logEntries;
    logEntries = _.map(entries, function(entry) {
      var logEntry = new LogEntry();
      logEntry.fromJSON(JSON.parse(entry));
      return logEntry;
    });

    console.log('Fetched the stored log entries');
  }
});
