var currentTab = '' +
  '<% if (entry) { %>' +
    '<h2>Your digital citizenship</h2>' +
    '<% if (citizenship.length > 0) { %>' +
      '<% _.each(citizenship, function(country) { %>' +
      '  <%= country.code %>: <%= country.percentage %>%<br><br>' +
      '<% }); %>' +
    '<% } else { %>' +
      '<p>No country data available yet.</p>' +
    '<% }; %>' +
    '<h2>Your location</h2>' +
    '<% if (ownGeoData) { %>' +
      '<p>Your IP address: <%= ownGeoData.ownIp %>. You’re in <%= ownGeoData.ownCity %>, <%= ownGeoData.ownCountryCode %>.</p>' +
      '<p>Lat: <%= ownGeoData.ownLat %>, lng: <%= ownGeoData.ownLng %></p>' +
    '<% } else { %>' +
      '<p>No geo data available yet.</p>' +
    '<% }; %>' +
    '<h2>Currently viewing</h2>' +
    '<% if (entry.ip) { %>' +
      '<p>IP: <%= entry.ip %>. This address is located in <%= entry.city %>, <%= entry.countryCode %>.</p>' +
      '<p>Lat: <%= entry.lat %>, lng: <%= entry.lng %></p>' +
    '<% } else { %>' +
      '<p>No geo data available yet.</p>' +
    '<% }; %>' +
  '<% } else { %>' +
    '<p>No data available yet.</p>' +
  '<% }; %>' +
  '<a href="#" name="about">About</a>' +
  '<a href="#" name="settings">Settings</a>';
var about = '<h1>About</h1>' +
  '<a href="#" name="currentTab">Current page</a>' +
  '<a href="#" name="settings">Settings</a>';
var settings = '<h1>Settings</h1>' +
  '<a href="#" class="erase">Erase all data (cannot undo this action)</a>' +
  '<a href="#" name="currentTab">Current page</a>' +
  '<a href="#" name="about">About</a>';

var Pane = function(name, template) {
  this.name = name;
  this.template = template;
};

var panes = [
  new Pane('currentTab', currentTab),
  new Pane('about', about),
  new Pane('settings', settings)
];

var Sidebar = Backbone.Model.extend({
  initialize: function(panes) {
    this.panes = panes;
    this.resetValues();
    this.getLogEntryForTab();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    chrome.storage.local.get('logEntries', _.bind(function(entries) {
      var logEntries = entries.logEntries;
      var validEntries = _.reject(logEntries, function(entry) {
        return entry.countryCode === undefined;
      });
      var countryCodes = _.countBy(validEntries, function(entry) {
        if (entry.countryCode === '') {
          return 'Unknown';
        }
        return entry.countryCode;
      });
      var sum = _.reduce(countryCodes, function(memo, num) { return memo + num; }, 0);
      var countries = [];
      _.each(countryCodes, function(value, key) {
        var percentage = (value / sum) * 100;
        percentage = percentage.toFixed(2);
        countries.push({ code: key, percentage: percentage });
      });
      countries = _.sortBy(countries, 'percentage');
      this.set({ citizenship: countries.reverse() });

    }, this));
  },

  getLogEntryForTab: function() {
    chrome.runtime.sendMessage({ activeTab: true }, _.bind(function(response) {
      var tab = response;
      chrome.storage.local.get('logEntries', _.bind(function(entries) {
        var logEntries = entries.logEntries;

        if (!logEntries) {
          this.set({ entry: '' });
          return;
        }

        var entry = _.find(logEntries, function(logEntry) {
          return logEntry.url === tab.url && logEntry.tabId === tab.id && logEntry.windowId === tab.windowId;
        });
        this.set({ entry: entry });

      }, this));

    }, this));
  },

  getOwnGeoData: function() {
    chrome.storage.local.get('ownGeoData', _.bind(function(ownGeoData) {
      this.set({ ownGeoData: ownGeoData });
    }, this));
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
  },

  eraseData: function() {
    this.resetValues();
    chrome.storage.local.set({ ownGeoData: {} });
    chrome.storage.local.set({ logEntries: [] });
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
          this.$el.show();
          break;
        default:
          this.$el.hide();
          break;
      }
    } else {
      this.$el.hide();
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

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});
