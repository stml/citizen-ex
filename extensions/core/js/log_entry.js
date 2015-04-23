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
    var emptyResult = _.isEmpty(result);

    if (emptyResult) {
      // if there isn’t one we need to fetch it
      geoCache.addOwnLocation(this);
    } else {
      var ownGeoData = result.ownGeoData;
      var ownLocation = geoCache.getOwnLocation();

      // but if we have a new one we should use that
      if (ownLocation.ownIp) {
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

    }
  }, this));
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
