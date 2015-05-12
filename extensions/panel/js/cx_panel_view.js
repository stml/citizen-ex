// panel/js/cx_panel_view.js

var CxPanelView = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane',

  events: {
    'click .cex_erase': 'eraseData',
    'click .cex_close': 'close',
    'click .cex_more': 'openPage'
  },

  initialize: function(options) {
    this.template = _.template(options.template);

    this.listenTo(this.model, 'change:open', this.render);
    this.listenTo(this.model, 'change:currentEntry', this.render);
    this.listenTo(this.model, 'change:citizenship', this.render);
    this.listenTo(this.model, 'change:ownGeoData', this.render);
    this.listenTo(this.model, 'change:openTabsEntries', this.render);
    this.listenTo(this.model, 'change:openTabsCitizenship', this.render);

    this.appendToBody();
  },

  render: function() {
    if (this.model.get('open')) {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.slideDown();
    } else {
      this.$el.slideUp();
    }
  },

  appendToBody: function() {
    var body = $('body');
    if (body.length > 0) {
      this.$el.appendTo(body);
    } else {
      var html = $('html');
      html.append(this.$el);
    }
  },

  close: function(event) {
    event.preventDefault();
    this.model.close();
  },

  openPage: function(event) {
    if (this.model.browser && this.model.browser.firefox()) {
      event.preventDefault();
      this.model.requestPage();
    }
  },

  eraseData: function(event) {
    event.preventDefault();
    this.model.eraseData();
  }

});

