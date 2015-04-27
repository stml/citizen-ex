/*
 * DO NOT EDIT THIS FILE
 *
 * It will be automatically generated from
 * templates defines in ./gulpfile.js
 * any time the templates are updated
 *
 */

var Browser = function() {
  this.name = 'unknown';
  var notChrome = _.isUndefined(window.chrome);
  if (!notChrome) {
    this.name = 'chrome';
  } else {
    this.name = 'safari';
  }
};

Browser.prototype.chrome = function() {
  return this.name === 'chrome';
};

Browser.prototype.safari = function() {
  return this.name === 'safari';
};

var CxStorage = function(browser) {
  this.browser = browser;
};

CxStorage.prototype.set = function(property, value) {
  if (!property) {
    return;
  }

  var json = JSON.prune(value);
  if (this.browser.chrome()) {
    chrome.storage.local.set({ property: json });
  } else if (this.browser.safari()) {
    localStorage[property] = json;
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.get = function(property, callback) {
  if (this.browser.chrome()) {
    chrome.storage.local.get(property, function(result) {
      var data = undefined;
      if (result[property]) {
        var data = JSON.parse(result[property]);
      }
      callback(data);
    });
  } else if (this.browser.safari()) {
    var data = undefined;
    if (localStorage[property]) {
      var data = JSON.parse(localStorage[property]);
    }
    callback(data);
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.clear = function() {
  if (this.browser.chrome()) {
    chrome.storage.local.clear();
  } else if (this.browser.safari()) {
    localStorage.clear();
  } else {
    throw 'Unknown browser';
  }
};

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
  if (protocol === 'chrome' || protocol === 'chrome-devtools') {
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

// Define the LogEntry class

var LogEntry = function(url, timestamp) {
  if (url) {
    this.url = url;
    this.domain = utils.trimUrl(url);
    this.timestamps = [timestamp];
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

LogEntry.prototype.latestTimestamp = function() {
  return _.max(this.timestamps);
};

LogEntry.prototype.addTimestamp = function() {
  var timestamp = new Date();
  this.timestamps.push(timestamp);
};

LogEntry.prototype.storeEntries = function(entries) {
  storage.set('logEntries', entries);
};

LogEntry.prototype.getOwnGeo = function() {
  var ownLocation = geoCache.getOwnLocation();

  if (!ownLocation) {
    // if there isn’t one we need to fetch it
    geoCache.addOwnLocation(this);
    return;
  }

  // if there is one, we need to check how old it is
  var cutOffTime = moment(ownLocation.timestamp).add(1, 'hour').valueOf();
  var now = new Date();

  // if necessary, fetch a new own geo
  if (cutOffTime <= now.getTime()) {
    geoCache.addOwnLocation(this);
    return;
  }

  if (ownLocation.ownIp) {
    this.ownIp = ownLocation.ownIp;
    this.ownCountryCode = ownLocation.ownCountryCode;
    this.ownCountryName = ownLocation.ownCountryName;
    this.ownRegionCode = ownLocation.ownRegionCode;
    this.ownRegionName = ownLocation.ownRegionName;
    this.ownTimezone = ownLocation.ownTimezone;
    this.ownZipcode = ownLocation.ownZipcode;
    this.ownCity = ownLocation.ownCity;
    this.ownLat = ownLocation.ownLat;
    this.ownLng = ownLocation.ownLng;
    this.storeEntries(logEntries);

  } else {
    console.log('No own geo data available yet');
  }

};

LogEntry.prototype.getRemoteGeo = function(domain) {
  if (domain === undefined) {
    console.log('can’t geolocate without a domain');
    return;
  }

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

// Set up geo-cache

var GeoCache = function() {
  this.reset();
  this.addOwnLocation();
};

GeoCache.prototype.addOwnLocation = function(entry) {
  // skip if we are already fetching the data
  if (this.fetching) {
    return;
  }

  var timestamp = new Date();
  var ownGeoData = {
    ownGeoData: true,
    timestamp: timestamp.getTime()
  };

  var entry = entry;
  var url = 'https://freegeoip.net/json'

  this.fetching = true;
  utils.get(url, _.bind(function(response) {
    if (response) {
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

      console.log('Got own geo, caching it');
      geoCache.addOwnLocationEntry(ownGeoData);

      // now update the log entry
      if (entry) {
        entry.getOwnGeo();
      }

    } else {
      console.log('Can’t get own geo data');
    }
    this.fetching = null;
  }, this));
};

GeoCache.prototype.getOwnLocation = function() {
  return this.hasEntry('ownGeoData', true);
};

GeoCache.prototype.addOwnLocationEntry = function(ownGeoData) {
  if (!ownGeoData) {
    return;
  }
  this.removeOwnLocation();
  this.addEntry(ownGeoData);
  storage.set('ownGeoData', ownGeoData);
};

GeoCache.prototype.removeOwnLocation = function() {
  var ownLocation = this.getOwnLocation();
  if (ownLocation) {
    console.log('Removing old own location entry');
    this.removeEntry(ownLocation);
  }
};

GeoCache.prototype.hasEntry = function(property, value) {
  var cacheEntry = _.find(this.entries, function(entry) {
    if (entry) {
      return entry[property] === value;
    } else {
      return false;
    }
  });
  return cacheEntry;
};

GeoCache.prototype.addEntry = function(object) {
  console.log('Caching a new entry');
  this.entries.push(object);
  this.updateStorage();
};

GeoCache.prototype.removeEntry = function(object) {
  console.log('Removing an entry from cache');
  var index = this.entries.indexOf(object);
  if (index > -1) {
    this.entries.splice(index, 1);
  }
  this.updateStorage();
};

GeoCache.prototype.reset = function() {
  console.log('Resetting geo cache');
  this.entries = [];
  this.recoverFromStorage();
};

GeoCache.prototype.recoverFromStorage = function() {
  storage.get('geoCache', _.bind(function(geoCache) {
    if (_.isEmpty(geoCache) || geoCache === undefined || !geoCache) {
      return;
    }
    // handle how differently chrome works
    if (geoCache.geoCache) {
      this.entries = geoCache.geoCache;
    } else {
      this.entries = geoCache;
    }
    console.log('Got geo cache from storage');
  }, this));
};

GeoCache.prototype.updateStorage = function() {
  storage.set('geoCache', this.entries);
};

// Create and instantiate a country log

var CountryLog = function() {
  console.log('Creating a new CountryLog');
  this.reset();
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
  this.recoverFromStorage();
};

CountryLog.prototype.updateStorage = function() {
  storage.set({ 'countryLog': this.visits });
};

CountryLog.prototype.recoverFromStorage = function() {
  storage.get('countryLog', _.bind(function(countryLog) {
    if (_.isEmpty(countryLog) || countryLog === undefined) {
      return;
    }
    this.visits = countryLog.countryLog;
  }, this));
};

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

// Define and set up Safari utils

var SafariUtils = function() {};

var safariUtils = new SafariUtils();


safari.application.addEventListener('navigate', function(stuff) {
  // make a new entry
  utils.createLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);

safari.application.addEventListener('activate', function(stuff) {
  // update timestamp
  utils.updateLogEntry(safari.application.activeBrowserWindow.activeTab.url);
}, true);