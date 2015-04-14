var Sidebar = Backbone.Model.extend({

});

var SidebarPane = Backbone.View.extend({
  initialize: function(name) {
    this.name = name;
    this.listenTo(this.model, 'change:activePane', function(model, pane) {
      this.render(model, pane);
    })
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
  }
});


chrome.storage.local.get('logEntries', function(entries) {
  var logEntries = entries.logEntries;
  var lastEntry = logEntries[logEntries.length - 1];
  var logString = JSON.stringify(lastEntry);
  console.log(logString);
});



