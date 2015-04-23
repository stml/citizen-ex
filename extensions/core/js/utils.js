// Define and set up utilities

var Utils = function() {};

Utils.prototype.createLogEntry = function(tab) {
  if (!tab) {
    return;
  }

  // ignore empty tabs and chrome settings pages
  var protocol = utils.getUrlProtocol(tab.url);
  if (protocol === 'chrome' || protocol === 'chrome-devtools') {
    return;
  }

  var previousEntry = _.find(logEntries, function(entry) {
    return tab.url === entry.url && tab.id === entry.tabId && tab.windowId === entry.windowId;
  });
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
  }

  var timestamp = new Date();
  logEntries.push(new LogEntry(tab.url, timestamp, tab.id, tab.windowId));

  var logEntry = new LogEntry();
  logEntry.storeEntries(logEntries);
  console.log('Created a new LogEntry');
};

Utils.prototype.findLogEntry = function(url, tabId, windowId) {
  console.log(url, tabId, windowId);
  var selected = _.find(logEntries, function(entry) {
    return url === entry.url && parseInt(tabId) === entry.tabId && parseInt(windowId) === entry.windowId;
  });
  console.log(selected);
  return selected;
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
