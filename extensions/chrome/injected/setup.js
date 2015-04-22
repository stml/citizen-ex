/*
 * DO NOT EDIT THIS FILE
 *
 * It will be automatically generated from
 * templates defines in ./gulpfile.js
 * any time the templates are updated
 *
 */

var LogEntry = function() {};

LogEntry.prototype.fromJSON = function(json) {
  var that = this;
  _.each(json, function(value, key) {
    that[key] = value;
  });
  return this;
};

LogEntry.prototype.latestTimestamp = function() {
  return _.max(this.timestamps, function(timestamp) {
    return Date.parse(timestamp).value;
  });
};

var Sidebar = Backbone.Model.extend({
  initialize: function(panes) {
    this.panes = panes;
    this.resetValues();
    this.getOwnGeoData();
    this.getAllLogEntries();
    this.getLogEntryForTab();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    chrome.runtime.sendMessage({ countryLog: true }, _.bind(function(countryLog) {
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
    chrome.runtime.sendMessage({ allLogEntries: true }, _.bind(function(entries) {
      var logEntries = _.map(entries, function(entry) {
        var logEntry = new LogEntry();
        return logEntry.fromJSON(JSON.parse(entry));
      });

      if (!logEntries) {
        this.set({ logEntries: '' });
      } else {
        this.set({ logEntries: logEntries });
      }
    }, this));
  },

  getLogEntry: function(url, tabId, windowId) {
    var logEntries = this.get('logEntries');

    if (!logEntries) {
      return null;
    }

    var entry = _.find(logEntries, function(logEntry) {
      return logEntry.url === url && logEntry.tabId === tabId && logEntry.windowId === windowId;
    });
    return entry;
  },

  getLogEntryForTab: function() {
    chrome.runtime.sendMessage({ activeTab: true }, _.bind(function(response) {
      var tab = response;
      var entry = this.getLogEntry(tab.url, tab.id, tab.windowId);

      if (!entry) {
        this.set({ entry: '' });
        return;
      } else {
        this.set({ entry: entry });
      }


    }, this));
  },

  getOwnGeoData: function() {
    chrome.storage.local.get('ownGeoData', _.bind(function(object) {
      this.set({ ownGeoData: object.ownGeoData });
    }, this));
  },

  requestOpenTabs: function() {
    chrome.runtime.sendMessage({ allTabs: true });
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
        var logEntry = this.getLogEntry(tab.url, tab.id, tab.windowId);
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



var SidebarPane = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane',

  events: {
    'click .erase': 'eraseData',
    'click a': 'togglePane'
  },

  initialize: function(options) {
    this.name = options.name;
    this.template = _.template(options.template);

    this.listenTo(this.model, 'change:activePane', function(model, pane) {
      this.render(model, pane);
    });
    this.listenTo(this.model, 'change:entry', function(model, logEntry) {
      this.model.setUpCitizenship();
      this.render(model, this.model.get('activePane'));
    });
    this.listenTo(this.model, 'change:citizenship', function(model, citizenship) {
      this.render(model, this.model.get('activePane'));
    });
    this.listenTo(this.model, 'change:ownGeoData', function(model, ownGeoData) {
      this.render(model, this.model.get('activePane'));
    });

    this.appendToBody();
  },

  render: function(model, pane) {
    if (pane) {
      switch (pane.name) {
        case this.name:
          this.$el.html(this.template(this.model.toJSON()));
          this.$el.slideDown();
          break;
        default:
          this.$el.slideUp();
          break;
      }
    } else {
      this.$el.slideUp();
    }
  },

  appendToBody: function() {
    var body = $('body');
    this.$el.appendTo(body);
  },

  togglePane: function(event) {
    event.preventDefault();
    var paneName = event.currentTarget.name;
    this.model.activatePane(paneName);
  },

  eraseData: function(event) {
    event.preventDefault();
    this.model.eraseData();
  }

});


var currentTab = "<% if (entry) { %>\n  <h2>Your digital citizenship</h2>\n  <% if (citizenship.length > 0) { %>\n    <% _.each(citizenship, function(country) { %>\n      <%= country.code %>: <%= country.percentage %>%<br><br>\n      <% }); %>\n    <% } else { %>\n      <p>No country data available yet.</p>\n    <% }; %>\n    <h2>Your location</h2>\n    <% if (ownGeoData && ownGeoData.ownIp) { %>\n      <p>Your IP address: <%= ownGeoData.ownIp %>. You’re in <%= ownGeoData.ownCity %>, <%= ownGeoData.ownCountryCode %>.</p>\n      <p>Lat: <%= ownGeoData.ownLat %>, lng: <%= ownGeoData.ownLng %></p>\n    <% } else { %>\n      <p>No geo data available yet.</p>\n    <% }; %>\n    <h2>Currently viewing</h2>\n    <% if (entry.ip) { %>\n      <p>IP: <%= entry.ip %>. This address is located in <%= entry.city %>, <%= entry.countryCode %>.</p>\n      <p>Lat: <%= entry.lat %>, lng: <%= entry.lng %></p>\n    <% } else { %>\n      <p>No geo data available yet.</p>\n    <% }; %>\n  <% } else { %>\n    <p>No data available yet.</p>\n  <% }; %>\n  <a href=\"#\" name=\"settings\">Settings</a>\n";
var about = "<h1>About</h1>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"settings\">Settings</a>\n";
var settings = "<h1>Settings</h1>\n<a href=\"#\" class=\"erase\">Erase all data (cannot undo this action)</a>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"about\">About</a>\n\n\n";

var Pane = function(name, template) {
  this.name = name;
  this.template = template;
};

var panes = [
  new Pane('currentTab', currentTab),
  new Pane('about', about),
  new Pane('settings', settings)
];

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});


