// Define the LogEntry class

var LogEntry = function(url, timestamp, tabId, windowId) {
  if (url) {
    this.url = url;
    this.domain = utils.trimUrl(url);
    this.timestamps = [timestamp];
    this.tabId = tabId;
    this.windowId = windowId;
    this.getOwnGeo();
    this.getRemoteGeo(this.domain);
  }
};

LogEntry.prototype.fromJSON = function(json) {
  var that = this;
  _.each(json, function(value, key) {
    that[key] = value;
  });
  return this;
};

LogEntry.prototype.toJSON = function() {
  return JSON.prune(this);
};

LogEntry.prototype.latestTimestamp = function() {
  return _.max(this.timestamps);
};

LogEntry.prototype.addTimestamp = function() {
  var timestamp = new Date();
  this.timestamps.push(timestamp);
};

LogEntry.prototype.storeEntries = function(entries) {
  var logEntries = _.map(entries, function(entry) {
    return entry.toJSON();
  });
  chrome.storage.local.set({ 'logEntries': logEntries });
};

LogEntry.prototype.getOwnGeo = function() {
  chrome.storage.local.get('ownGeoData', _.bind(function(result) {
    // we try to retrieve the stored location
    var ownGeoData = result.ownGeoData;
    var ownLocation = geoCache.getOwnLocation();

    // but if we have a new one we should use that
    if (ownLocation) {
      ownGeoData = ownLocation;
    }

    if (ownGeoData.ownIp) {
      this.ownIp = ownGeoData.ownIp;
      this.ownCountryCode = ownGeoData.ownCountryCode;
      this.ownCountryName = ownGeoData.ownCountryName;
      this.ownRegionCode = ownGeoData.ownRegionCode;
      this.ownRegionName = ownGeoData.ownRegionName;
      this.ownTimezone = ownGeoData.ownTimezone;
      this.ownZipcode = ownGeoData.ownZipcode;
      this.ownCity = ownGeoData.ownCity;
      this.ownLat = ownGeoData.ownLat;
      this.ownLng = ownGeoData.ownLng;
      console.log('Using cached own geo');
      this.storeEntries(logEntries);
    } else {
      console.log('No own geo data available yet');
    }
  }, this));
};

LogEntry.prototype.getRemoteGeo = function(domain) {
  var cachedEntry = geoCache.hasEntry('domain', domain);
  if (cachedEntry && cachedEntry.ip) {
    this.ip = cachedEntry.ip;
    this.countryCode = cachedEntry.countryCode;
    this.countryName = cachedEntry.countryName;
    this.regionCode = cachedEntry.regionCode;
    this.regionName = cachedEntry.regionName;
    this.timezone = cachedEntry.timezone;
    this.zipcode = cachedEntry.zipcode;
    this.city = cachedEntry.city;
    this.lat = cachedEntry.lat;
    this.lng = cachedEntry.lng;
    countryLog.addVisit(this.countryCode);
    console.log('Retrieving entry details from cache');
    this.storeEntries(logEntries);
  } else {
    utils.get('https://freegeoip.net/json/' + domain, _.bind(function(response) {
      var json = JSON.parse(response);
      this.ip = json.ip;
      this.countryCode = json.country_code;
      this.countryName = json.country_name;
      this.regionCode = json.region_code;
      this.regionName = json.region_name;
      this.timezone = json.time_zone;
      this.zipcode = json.zip_code;
      this.city = json.city;
      this.lat = json.latitude;
      this.lng = json.longitude;
      console.log('Got remote geo, updating the relevant LogEntry');
      geoCache.removeEntry(cachedEntry);
      geoCache.addEntry(this);
      countryLog.addVisit(this.countryCode);
      this.storeEntries(logEntries);
    }, this));
  }
};


// Define and set up utilities

var Utils = function() {};

Utils.prototype.createLogEntry = function(tab) {
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
    previousEntry.addTimestamp();
    return;
  }

  var timestamp = new Date();
  logEntries.push(new LogEntry(tab.url, timestamp, tab.id, tab.windowId));

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

var utils = new Utils();


// Define and set up Chrome utils

var ChromeUtils = function() {};

ChromeUtils.prototype.getTabById = function(tabId, callback) {
  // we use a callback here because chrome.tabs.get is asynchronous
  chrome.tabs.get(tabId, callback);
};

var chromeUtils = new ChromeUtils();


// Fetch the stored log entries on load, so we can keep adding to them

var logEntries = [];
chrome.storage.local.get('logEntries', function(entries) {
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


// Set up geo-cache

var GeoCache = function() {
  console.log('Creating a new cache');
  this.entries = [];
  this.addOwnLocation();
};

GeoCache.prototype.addOwnLocation = function() {
  var ownGeoData = {
    ownGeoData: true
  };

  utils.get('https://freegeoip.net/json', _.bind(function(response) {
    var json = JSON.parse(response);
    ownGeoData.ownIp = json.ip;
    ownGeoData.ownCountryCode = json.country_code;
    ownGeoData.ownCountryName = json.country_name;
    ownGeoData.ownRegionCode = json.region_code;
    ownGeoData.ownRegionName = json.region_name;
    ownGeoData.ownTimezone = json.time_zone;
    ownGeoData.ownZipcode = json.zip_code;
    ownGeoData.ownCity = json.city;
    ownGeoData.ownLat = json.latitude;
    ownGeoData.ownLng = json.longitude;

    geoCache.addEntry(ownGeoData);

    // store this so that it’s available to the template
    chrome.storage.local.set({ ownGeoData: ownGeoData });

    console.log('Got own geo, caching it');
  }, ownGeoData));
};

GeoCache.prototype.getOwnLocation = function() {
  return this.hasEntry('ownGeoData', true);
}

GeoCache.prototype.hasEntry = function(property, value) {
  var cacheEntry = _.find(this.entries, function(entry) {
    return entry[property] === value;
  });
  return cacheEntry;
};

GeoCache.prototype.addEntry = function(object) {
  console.log('Caching a new entry');
  this.entries.push(object);
};

GeoCache.prototype.removeEntry = function(object) {
  console.log('Removing an entry from cache');
  var index = this.entries.indexOf(object);
  if (index > -1) {
    this.entries.splice(index, 1);
  }
};

var geoCache = new GeoCache();


// Create and instantiate a country log

var CountryLog = function() {
  this.reset();
  this.recoverFromStorage();
};

CountryLog.prototype.addVisit = function(country) {
  if (_.has(this.visits, country)) {
    this.visits[country]++;
  } else {
    this.visits[country] = 1;
  }
  this.updateStorage();
};

CountryLog.prototype.reset = function() {
  this.visits = {};
};

CountryLog.prototype.updateStorage = function() {
  chrome.storage.local.set({ 'countryLog': this.visits });
};

CountryLog.prototype.recoverFromStorage = function() {
  chrome.storage.local.get('countryLog', _.bind(function(countryLog) {
    if (_.isEmpty(countryLog)) {
      return;
    }
    this.visits = countryLog;
  }, this));
};

var countryLog = new CountryLog();


// Respond to events

chrome.tabs.onUpdated.addListener(function(tabId) {
  chromeUtils.getTabById(tabId, utils.createLogEntry);
});

chrome.tabs.onCreated.addListener(function(tab) {
  utils.createLogEntry(tab);
});

// fires when an existing tab is selected
chrome.tabs.onActivated.addListener(function(activeInfo) {
  var tabId = activeInfo.tabId;
  chromeUtils.getTabById(tabId, utils.createLogEntry);
});

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, { file: 'injected/browserAction.js' });
});

chrome.storage.onChanged.addListener(function(data) {
  if (data.logEntries) {
    if (_.has(data.logEntries, 'newValue')) {
      return;
    }

    // if there are no values then it means we want to clear all history
    utils.reset();
  }
});

// we have to use Chrome’s messaging system because the page can’t find out its own tabId
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.activeTab) {
    sendResponse(sender.tab);
  } else if (request.allTabs) {
    var windowId = sender.tab.windowId;
    var senderObject = sender;

    // this has to use message sending back and forth
    // simple value sending to a callback fails
    chrome.tabs.query({ windowId: windowId }, function(tabs) {
      chrome.tabs.sendMessage(senderObject.tab.id, { tabs: tabs });
    });
  } else if (request.allLogEntries) {
    sendResponse(logEntries);
  } else if (request.countryLog) {
    console.log(countryLog);
    sendResponse(countryLog);
  }
});
