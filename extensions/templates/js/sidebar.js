var Sidebar = Backbone.Model.extend({
  initialize: function(panes, browser) {
    this.panes = panes;
    this.browser = browser;
    this.resetValues();
    this.getOwnGeoData();
    this.getAllLogEntries();
    this.getLogEntryForTab();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    message.send({ countryLog: true }, _.bind(function(countryLog) {
      var countryCodes = _.pick(countryLog.visits, _.identity);
      var citizenship = this.calculateCitizenship(countryCodes);
      this.set({ citizenship: citizenship });
    }, this));
  },

  setUpOpenTabsCitizenship: function() {
    var tabEntries = this.get('tabEntries');
    var validEntries = _.reject(tabEntries, function(entry) {
      return entry.countryCode === undefined || entry.countryCode === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry.countryCode;
    });
    var openTabsCitizenship = this.calculateCitizenship(countryCodes);
    this.set({ openTabsCitizenship: openTabsCitizenship });
  },

  calculateCitizenship: function(countryCodes) {
    var sum = _.reduce(countryCodes, function(memo, num) { return memo + num; }, 0);
    var countries = [];
    _.each(countryCodes, function(value, key) {
      var percentage = (value / sum) * 100;
      percentage = percentage.toFixed(2);
      countries.push({ code: key, percentage: percentage });
    });
    countries = _.sortBy(countries, 'percentage');

    return countries.reverse();
  },

  getCitizenshipForDays: function(n) {
    var entries = this.getTabEntriesForDays(n);
    var countryCodes = this.getCountryCodesFromEntries(entries);
    var citizenship = this.calculateCitizenship(countryCodes);
    return citizenship;
  },

  getCountryCodesFromEntries: function(entries) {
    var validEntries = _.reject(entries, function(entry) {
      return entry.countryCode === undefined || entry.countryCode === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry.countryCode;
    });
    return countryCodes;
  },

  getAllLogEntries: function() {
    message.send({ allLogEntries: true }, _.bind(function(entries) {
      var logEntries = _.map(entries, function(entry) {
        var logEntry = new LogEntry();
        return logEntry.fromJSON(entry);
      });

      if (!logEntries) {
        this.set({ logEntries: '' });
      } else {
        this.set({ logEntries: logEntries });
      }
    }, this));
  },

  getLogEntry: function(url) {
    var logEntries = this.get('logEntries');

    if (!logEntries) {
      return null;
    }

    var entries = _.filter(logEntries, function(logEntry) {
      return logEntry.url === url;
    });
    latestEntry = _.max(entries, function(entry) {
      return _.max(entry.timestamps);
    });
    return latestEntry;
  },

  getLogEntryForTab: function() {
    message.send({ activeTab: true }, _.bind(function(response) {
      var tab = response;
      var entry = this.getLogEntry(tab.url);

      if (!entry) {
        this.set({ entry: '' });
        return;
      } else {
        this.set({ entry: entry });
      }

    }, this));
  },

  getOwnGeoData: function() {
    // we can’t get it from storage (not shared)
    // we have to fetch it using the messaging system
    message.send({ ownGeoData: true }, _.bind(function(ownGeoData) {
      this.set({ ownGeoData: ownGeoData });
    }, this));
  },

  requestOpenTabs: function() {
    message.send({ allTabs: true });
  },

  updateTabs: function(tabs) {
    this.set({ tabs: tabs });
    this.getTabEntries();
  },

  getTabEntries: function() {
    var tabs = this.get('tabs');

    if (tabs) {
      var entries = [];
      _.each(tabs, _.bind(function(tab) {
        var logEntry = this.getLogEntry(tab.url);
        if (logEntry) {
          entries.push(logEntry);
        }
      }, this));
      this.set({ tabEntries: entries });
      this.setUpOpenTabsCitizenship();
    } else {
      this.set({ tabEntries: [] });
    }
  },

  getTabEntriesForDays: function(n) {
    var tabEntries = this.get('tabEntries');
    var cutOffDate = moment().subtract(n, 'days').valueOf();
    var latestEntries = _.filter(tabEntries, function(entry) {
      return entry.latestTimestamp() <= cutOffDate;
    });
    return latestEntries;
  },

  activatePane: function(name) {
    var pane = _.find(this.panes, function(pane) {
      return pane.name === name;
    });
    this.set({ activePane: pane });
  },

  toggle: function() {
    if (this.has('activePane')) {
      this.close();
    } else {
      this.open();
    }
  },

  open: function() {
    this.set({ activePane: this.panes[0] });
  },

  close: function() {
    this.unset('activePane');
  },

  resetValues: function() {
    this.set({ citizenship: [] });
    this.set({ ownGeoData: '' });
    this.set({ entry: '' });
    this.unset('logEntries');
    this.unset('tabs');
    this.unset('tabEntries');
  },

  eraseData: function() {
    this.resetValues();
    chrome.storage.local.clear();
  }
});


