// Define the LogEntry class

var LogEntry = function(url, timestamp, tabId, windowId) {
  this.url = url;
  this.domain = utils.trimUrl(url);
  this.timestamp = timestamp;
  this.tabId = tabId;
  this.windowId = windowId;
  this.getOwnGeo();
  this.getRemoteGeo(this.domain);
};

LogEntry.prototype.getOwnGeo = function() {
  chrome.storage.local.get('ownGeoData', function(result) {
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
      this.ownRegionCode = ownGeoData.ownRegionCode;
      this.ownCity = ownGeoData.ownCity;
      this.ownLat = ownGeoData.ownLat;
      this.ownLng = ownGeoData.ownLng;
      console.log('Using cached own geo');
      chrome.storage.local.set({ 'logEntries': logEntries });
    } else {
      console.log('No own geo data available yet');
    }
  })
};

LogEntry.prototype.getRemoteGeo = function(domain) {
  var cachedEntry = geoCache.hasEntry('domain', domain);
  if (cachedEntry && cachedEntry.ip) {
    this.ip = cachedEntry.ip;
    this.countryCode = cachedEntry.countryCode;
    this.regionCode = cachedEntry.regionCode;
    this.city = cachedEntry.city;
    this.lat = cachedEntry.lat;
    this.lng = cachedEntry.lng;
    console.log('Retrieving entry details from cache');
    chrome.storage.local.set({ 'logEntries': logEntries });
  } else {
    utils.get('https://freegeoip.net/json/' + domain, _.bind(function(response) {
      var json = JSON.parse(response);
      this.ip = json.ip;
      this.countryCode = json.country_code;
      this.regionCode = json.region_code;
      this.city = json.city;
      this.lat = json.latitude;
      this.lng = json.longitude;
      console.log('Got remote geo, updating the relevant LogEntry');
      geoCache.removeEntry(cachedEntry);
      geoCache.addEntry(this);
      chrome.storage.local.set({ 'logEntries': logEntries });
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
    // for now, return — we don’t need to do anything else
    console.log('Entry exists, skipping creation');
    return;
  }

  var timestamp = new Date();
  logEntries.push(new LogEntry(tab.url, timestamp, tab.id, tab.windowId));
  chrome.storage.local.set({ 'logEntries': logEntries });
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
    logEntries = entries.logEntries;
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
    ownGeoData.ownRegionCode = json.region_code;
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
  if (data.logEntries && data.logEntries.newValue.length === 0) {
    logEntries = [];
    geoCache = new GeoCache();
    console.log('Erased browsing data');
  }
});

// we have to use Chrome’s messaging system because the page can’t find out its own tabId
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.activeTab) {
    sendResponse(sender.tab);
  }
});
