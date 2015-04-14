var currentTab = "<h1>This page</h1>" +
  "<%= lastLogEntry.ownLat =>";
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
  initialize: function(panes) {
    this.panes = panes;
    this.getLastLogEntry();
  },

  getLastLogEntry: function() {
    chrome.storage.local.get('logEntries', _.bind(function(entries) {
      var logEntries = entries.logEntries;
      var lastEntry = logEntries[logEntries.length - 1];
      var logString = JSON.stringify(lastEntry);
      this.set({ lastLogEntry: lastEntry });
    }, this));
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
    this.listenTo(this.model, 'change:lastLogEntry', this.loadPaneContents);
    this.appendToBody();
  },

  render: function(model, pane) {
    switch (pane.name) {
      case this.name:
        this.$el.show();
        this.$el.html(this.template(this.model.toJSON()));
        break;
      default:
        this.$el.hide();
        break;
    }

  },

  appendToBody: function() {
    var body = $('body');
    this.$el.appendTo(body);
  },

  loadPaneContents: function() {
    this.$el.html(this.template(this.model.toJSON()));
  }
});

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});
