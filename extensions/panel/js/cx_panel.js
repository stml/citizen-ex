// panel/js/cx_panel.js

var CxPanel = CxExtension.extend({
  initialize: function(browser) {
    CxExtension.prototype.initialize.apply(this, browser);

    this.requestActiveTab();
    this.requestOpenTabs();
  },

  requestActiveTab: function() {
    message.send({ activeTab: true });
  },

  requestOpenTabs: function() {
    message.send({ allTabs: true });
  },

  receiveActiveTab: function(url) {
    var entry = this.getLogEntryForUrl(url);

    if (!entry) {
      this.set({ currentEntry: '' });
      return;
    } else {
      this.set({ currentEntry: entry });
    }
  },

  receiveOpenTabs: function(urls) {
    this.set({ openTabs: urls });
    this.getOpenTabEntries();
  },

  getOpenTabEntries: function() {
    var tabs = this.get('openTabs');

    if (!_.isEmpty(tabs)) {
      var entries = [];
      _.each(tabs, _.bind(function(tabUrl) {
        var logEntry = this.getLogEntryForUrl(tabUrl);
        if (logEntry && logEntry !== -Infinity) {
          entries.push(logEntry);
        }
      }, this));
      this.set({ openTabEntries: entries });
      this.setUpOpenTabsCitizenship();
    } else {
      this.set({ openTabEntries: [] });
    }
  },

  setUpOpenTabsCitizenship: function() {
    var tabEntries = this.get('openTabEntries');
    var validEntries = _.reject(tabEntries, function(entry) {
      return entry.countryCode === undefined || entry.countryCode === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry.countryCode;
    });
    var openTabsCitizenship = this.calculatePercentages(countryCodes);
    this.set({ openTabsCitizenship: openTabsCitizenship });
  },

  open: function() {
    this.set({ open: true });
  },

  close: function() {
    this.set({ open: false });
  },

  toggle: function() {
    if (this.get('open')) {
      this.close();
    } else {
      this.open();
    }
  },

  resetValues: function() {
    this.set({ open: false });

    this.set({ currentEntry: '' });
    this.set({ openTabEntries: [] });
    this.set({ openTabsCitizenship: [] });

    CxExtension.prototype.resetValues.apply(this);
  },

  eraseData: function() {
    this.resetValues();
  }

});


