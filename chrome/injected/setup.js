var currentTab = '' +
  '<h2>Your location</h2>' +
  '<p>Your IP address: <%= lastLogEntry.ownIp %>. You’re in <%= lastLogEntry.ownCity %>, <%= lastLogEntry.ownCountryCode %>.</p>' +
  '<p>Lat: <%= lastLogEntry.ownLat %>, lng: <%= lastLogEntry.ownLng %></p>' +
  '<h2>Currently viewing</h2>' +
  '<p>IP: <%= lastLogEntry.ip %>. This address is located in <%= lastLogEntry.city %>, <%= lastLogEntry.countryCode %>.</p>' +
  '<p>Lat: <%= lastLogEntry.lat %>, lng: <%= lastLogEntry.lng %></p>' +
  '<h2>Your digital citizenship</h2>' +
  '<% _.each(citizenship, function(country) { %>' +
  '  <br><%= country.code %>: <%= country.percentage %>%' +
  '<% }); %>';
var about = '<h1>About</h1>';
var settings = '<h1>Settings</h1>';

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
  defaults: {
    'citizenship': []
  },

  initialize: function(panes) {
    this.panes = panes;
    this.getLastLogEntry();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    chrome.storage.local.get('logEntries', _.bind(function(entries) {
      var logEntries = entries.logEntries;
      var countryCodes = _.countBy(logEntries, function(entry) {
        if (entry.countryCode === '' || entry.countryCode === undefined) {
          return 'Unknown';
        }
        return entry.countryCode;
      });
      var sum = _.reduce(countryCodes, function(memo, num) { return memo + num; }, 0);
      var countries = [];
      _.each(countryCodes, function(value, key) {
        var percentage = value / sum;
        percentage = percentage.toFixed(4);
        countries.push({ code: key, percentage: percentage });
      });
      countries = _.sortBy(countries, 'percentage');
      this.set({ citizenship: countries.reverse() });

    }, this));
  },

  getLastLogEntry: function() {
    chrome.storage.local.get('logEntries', _.bind(function(entries) {
      var logEntries = entries.logEntries;
      var lastEntry = logEntries[logEntries.length - 1];
      var logString = JSON.stringify(lastEntry);
      this.set({ lastLogEntry: lastEntry });
    }, this));
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
  }
});

var SidebarPane = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane',

  initialize: function(options) {
    this.name = options.name;
    this.template = _.template(options.template);

    this.listenTo(this.model, 'change:activePane', function(model, pane) {
      this.render(model, pane);
    });
    this.listenTo(this.model, 'change:lastLogEntry', function(model, logEntry) {
      this.render(model, this.model.get('activePane'));
    });
    this.listenTo(this.model, 'change:citizenship', function(model, citizenship) {
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
  }

});

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});
