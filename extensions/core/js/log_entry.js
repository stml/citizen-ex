// Define the LogEntry class

var LogEntry = function(url, timestamp, tabId) {
  if (url) {
    this.url = url;
    this.domain = utils.trimUrl(url);
    this.timestamps = [timestamp.toISOString()];
    this.tabId = tabId;
    icon.setIcon('blank', this.tabId);
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
  this.timestamps.push(timestamp.toISOString());
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
    if (this.ip) {
      icon.setIcon('full', this.tabId);
    } else {
      icon.setIcon('local', this.tabId);
    }
    message.send({ ownGeoData: true });
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
    if (this.ownIp) {
      icon.setIcon('full', this.tabId);
    } else {
      icon.setIcon('remote', this.tabId);
    }
    console.log('Retrieving entry details from cache');
    this.storeEntries(logEntries);
    message.send({ activeTab: true });
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
      if (this.ownIp) {
        icon.setIcon('full', this.tabId);
      } else {
        icon.setIcon('remote', this.tabId);
      }
      console.log('Got remote geo, updating the relevant LogEntry');
      geoCache.removeEntry(cachedEntry);
      geoCache.addEntry(this);
      countryLog.addVisit(this.countryCode);
      this.storeEntries(logEntries);
      message.send({ activeTab: true });
    }, this));
  }
};
