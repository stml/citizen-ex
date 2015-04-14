var Pane = function(name) {
  this.name = name;
};

var panes = [
  new Pane('currentTab'),
  new Pane('about'),
  new Pane('settings')
];

var Sidebar = Backbone.Model.extend({
  initialize: function(panes) {
    this.panes = panes;
    this.set({ activePane: this.panes[0] });
  }
});

var SidebarPane = Backbone.View.extend({
  tagName: 'div',

  className: 'pane',

  initialize: function(options) {
    this.name = options.name;
    var pane = _.find(this.model.panes, _.bind(function(pane) {
      return pane.name === this.name;
    }, this));

    this.listenTo(this.model, 'change:activePane', function(model, pane) {
      this.render(model, pane);
    })
    this.appendToBody();
    this.render(this.model, pane);
  },

  render: function(model, pane) {
    switch (pane.name) {
      case this.name:
        this.$el.show();
        break;
      default:
        this.$el.hide();
        break;
    }
  },

  appendToBody: function() {
    var body = $('body');
    this.$el.appendTo(body);
  }
});

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar });
});
