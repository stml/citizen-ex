var OptionsPage = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane open',

  events: {
    'click .cex_erase': 'eraseData',
    'click .cex_toggle': 'toggleTimeframe'
  },

  initialize: function(options) {
    this.name = options.name;
    this.template = _.template(options.template);
    this.listenTo(this.model, 'change', this.render);

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

  eraseData: function(event) {
    event.preventDefault();
    this.model.eraseData();
  }

});


