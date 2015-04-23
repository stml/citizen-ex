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
