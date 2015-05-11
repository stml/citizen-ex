// page/js/cx_page_view.js

var CxPageView = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane open',

  events: {
    'click .cex_erase': 'eraseData',
    'click .cex_toggle': 'toggleTimeframe',
    'click .cex_sharedata': 'toggleAllTime'
  },

  initialize: function(options) {
    this.name = options.name;
    this.template = _.template(options.template);
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'change:citizenship', this.triggerTimeframe);
    this.listenTo(this.model, 'change:logEntries', this.triggerTimeframe);

    this.appendToBody();
    this.render();
  },

  render: function(model, pane) {
    this.$el.html(this.template(this.model.toJSON()));
  },

  appendToBody: function() {
    var body = $('body');
    this.$el.appendTo(body);
  },

  toggleTimeframe: function(event) {
    event.preventDefault();
    this.model.toggleTimeframe(event.target.name);
  },

  toggleAllTime: function(event) {
    event.preventDefault();
    this.model.toggleTimeframe(this.model.timeframes[0].name);
  },

  triggerTimeframe: function() {
    if (this.model.get('timeframe') && this.model.get('timeframe').name) {
      this.model.toggleTimeframe(this.model.get('timeframe').name);
    }
  },

  eraseData: function(event) {
    event.preventDefault();
    this.model.eraseData();
  }
});


