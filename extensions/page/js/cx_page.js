// page/js/cx_page.js

var CxPage = CxExtension.extend({
  initialize: function(browser, timeframes) {
    CxExtension.prototype.initialize.apply(this, browser);
    this.timeframes = timeframes;
    this.set({ currentEntry: '' })

    this.set({ timeframe: this.timeframes[0] });
    this.toggleTimeframe(this.timeframes[0].name);
  },

  getCitizenshipForDays: function(n) {
    if (n === null) {
      return this.get('citizenship');
    }
    var entries = this.getTabEntriesForDays(n);
    var countryCodes = this.getPropertyFromEntries(entries, 'countryCode');
    var citizenship = this.calculatePercentages(countryCodes);
    return citizenship;
  },

  getDomainsForDays: function(n) {
    var entries = this.getTabEntriesForDays(n);
    var domains = this.getDomainPropertiesFromEntries(entries);
    var domainPopularity = this.calculateDomainPercentages(domains);
    return domainPopularity;
  },

  getTabEntriesForDays: function(n) {
    var unit = 'days';
    if (n === null) {
      return this.get('logEntries');
    } else if (n === 1) {
      unit = 'day';
    }

    var entries = this.get('logEntries');
    var cutOffDate = moment().subtract(n, unit).valueOf();

    var latestEntries = _.filter(entries, function(entry) {
      return entry.latestTimestamp() >= cutOffDate;
    });
    return latestEntries;
  },

  toggleTimeframe: function(name) {
    var timeframe = _.find(this.timeframes, function(tf) {
      return tf.name === name;
    });

    var entries = this.getTabEntriesForDays(timeframe.duration);
    var domains = this.getDomainsForDays(timeframe.duration);
    var citizenship = this.getCitizenshipForDays(timeframe.duration);
    this.set({
      timeframeCitizenship: citizenship,
      timeframeEntries: entries,
      timeframeDomains: domains,
      timeframe: timeframe
    });
  },

  resetValues: function() {
    this.set({
      timeframeCitizenship: [],
      timeframeEntries: [],
      timeframeDomains: [],
      timeframe: null
    });

    CxExtension.prototype.resetValues.apply(this);
  },

  eraseData: function() {
    this.resetValues();
  }

});


