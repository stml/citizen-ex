// panel/js/cx_panel.js

var CxPanel = CxExtension.extend({
  initialize: function(browser) {
    CxExtension.prototype.initialize.call(this, browser);

    this.requestActiveTab();
    this.requestOpenTabs();
    this.on('change:logEntries', this.updateState, this);
  },

  updateState: function() {
    this.requestActiveTab();
  },

  requestActiveTab: function() {
    message.send({ activeTab: true });
  },

  requestPage: function() {
    if (this.browser.firefox()) {
      cxPage.open();
      this.close();
    } else {
      message.send({ page: true });
    }
  },

  requestOpenTabs: function() {
    message.send({ allTabs: true });
  },

  receiveActiveTab: function(url) {
    // deal with Firefox
    if (_.has(url, 'activeTab')) {
      url = this.get('currentEntry').url;
      this.requestLogEntries();
      this.requestActiveTab();
      this.requestCitizenship();
      return;
    }

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


  resetValues: function() {
    this.set({ currentEntry: '' });
    this.set({ openTabEntries: [] });
    this.set({ openTabsCitizenship: [] });

    CxExtension.prototype.resetValues.call(this);
  },

  eraseData: function() {
    this.resetValues();
  }

});


