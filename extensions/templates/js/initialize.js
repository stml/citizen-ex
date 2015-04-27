var currentTab = INCLUDE_FILE('../html/index.html');
var about = INCLUDE_FILE('../html/about.html');
var settings = INCLUDE_FILE('../html/settings.html');

var browser = new Browser();
var storage = new CxStorage(browser);
var message = new CxMessage(browser);

var Pane = function(name, template) {
  this.name = name;
  this.template = template;
};

var panes = [
  new Pane('currentTab', currentTab),
  new Pane('about', about),
  new Pane('settings', settings)
];

var sidebar = new Sidebar(panes, browser);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});


