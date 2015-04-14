var LogEntry = function(url, startTimestamp, tabId, windowId) {
  this.url = url;
  this.domain = utils.trimUrl(url);
  this.timestampRanges = [startTimestamp];
  this.getOwnGeo();
  this.getRemoteGeo(this.domain);
  this.tabId = tabId;
  this.windowId = windowId;
};

LogEntry.prototype.getOwnGeo = function() {
  utils.get('https://freegeoip.net/json', _.bind(function(response) {
    var json = JSON.parse(response);
    this.ownIp = json.ip;
    this.ownCountryCode = json.country_code;
    this.ownRegionCode = json.region_code;
    this.ownCity = json.city;
    this.ownLat = json.latitude;
    this.ownLng = json.longitude;
    chrome.storage.local.set({ 'logEntries': logEntries });
  }, this));
};

LogEntry.prototype.getRemoteGeo = function(url) {
  utils.get('https://freegeoip.net/json/' + url, _.bind(function(response) {
    var json = JSON.parse(response);
    this.ip = json.ip;
    this.countryCode = json.country_code;
    this.regionCode = json.region_code;
    this.city = json.city;
    this.lat = json.latitude;
    this.lng = json.longitude;
    chrome.storage.local.set({ 'logEntries': logEntries });
  }, this));
}

LogEntry.prototype.addEndTimestamp = function(timestamp) {
  var lastRange = this.timestampRanges[this.timestampRanges.length - 1];
  if (lastRange.length === 1) {
    lastRange.push(timestamp);
  }
};

var Utils = function() {};

Utils.prototype.createLogEntry = function(tab) {
  // ignore empty tabs and chrome settings pages
  var protocol = utils.getUrlProtocol(tab.url);
  if (protocol === 'chrome' || protocol === 'chrome-devtools') {
    return;
  }

  var timestamp = new Date();
  logEntries.push(new LogEntry(tab.url, timestamp, tab.id));
};

Utils.prototype.pauseLatestEntry = function() {
  var timestamp = new Date();
  var lastEntry = logEntries[logEntries.length - 1];
  // now run addEndTimestamp()
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
}

Utils.prototype.log = function(thing) {
  console.log(thing);
};

Utils.prototype.get = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(xhr.responseText);
    }
  }
  xhr.send();
};

var utils = new Utils();

var ChromeUtils = function() {};

ChromeUtils.prototype.getTabById = function(tabId, callback) {
  // we use a callback here because chrome.tabs.get is asynchronous
  chrome.tabs.get(tabId, callback);
};

var chromeUtils = new ChromeUtils();

var logEntries = [];
chrome.storage.local.get('logEntries', function(entries) {
  logEntries = entries.logEntries;
});

chrome.tabs.onUpdated.addListener(function(tabId) {
  chromeUtils.getTabById(tabId, utils.createLogEntry);
});

chrome.tabs.onCreated.addListener(function(tab) {
  utils.createLogEntry(tab);
});

// fires when an existing tab is selected
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // add end timestamp to latest entry
  utils.pauseLatestEntry();
  // and create a new entry
  var tabId = activeInfo.tabId;
  chromeUtils.getTabById(tabId, utils.createLogEntry);
});

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, { file: 'injected/browserAction.js' });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  // add end timestamp to latest entry
  utils.pauseLatestEntry();
});
