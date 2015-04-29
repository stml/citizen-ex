// Define and set up utilities

var Utils = function(browser) {
  this.browser = browser;
};

Utils.prototype.findEntryForUrl = function(url) {
  var entries = _.filter(logEntries, function(logEntry) {
    return logEntry.url === url;
  });
  if (!_.isEmpty(entries)) {
    latestEntry = _.max(entries, function(entry) {
      return _.max(entry.timestamps);
    });
    return latestEntry;
  } else {
    return null;
  }
};

Utils.prototype.updateLogEntry = function(url) {
  if (!url) {
    return;
  }

  // ignore empty tabs and chrome settings pages
  var protocol = utils.getUrlProtocol(url);
  if (protocol === 'chrome' || protocol === 'chrome-devtools') {
    return;
  }

  var previousEntry = utils.findEntryForUrl(url);
  if (previousEntry) {
    console.log('Entry exists, skipping creation and adding a timestamp');
    if (previousEntry.ownIp === undefined) {
      previousEntry.getOwnGeo();
    }
    if (previousEntry.ip === undefined) {
      previousEntry.getRemoteGeo(previousEntry.domain);
    }
    previousEntry.addTimestamp();
    return;
  } else {
    this.createLogEntry(url);
  }
};

Utils.prototype.createLogEntry = function(url) {
  if (!url) {
    return;
  }

  // ignore empty tabs and chrome settings pages
  var protocol = utils.getUrlProtocol(url);
  if (protocol === 'chrome' || protocol === 'chrome-devtools' || protocol === 'chrome-extension') {
    return;
  }

  var timestamp = new Date();
  logEntries.push(new LogEntry(url, timestamp));

  var logEntry = new LogEntry();
  logEntry.storeEntries(logEntries);
  console.log('Created a new LogEntry');
};

Utils.prototype.trimUrl = function(url) {
  var uri = new URI(url);
  var path = uri.hostname();
  return path;
};

Utils.prototype.getUrlProtocol = function(url) {
  var uri = new URI(url);
  var protocol = uri.protocol();
  return protocol;
};

Utils.prototype.log = function(thing) {
  console.log(thing);
};

Utils.prototype.get = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
     callback(xhr.responseText);
    } else if (xhr.readyState == 4) {
      console.log('Error getting response data from ' + url);
    }
  }
  xhr.send();
};

Utils.prototype.reset = function() {
  logEntries = [];
  countryLog.reset();
  geoCache = new GeoCache();
  console.log('Erased browsing data');
};
