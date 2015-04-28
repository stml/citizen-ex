var currentTab = INCLUDE_FILE('../html/index.html');

var browser = new Browser();
var storage = new CxStorage(browser);
var message = new CxMessage(browser);

var Pane = function(name, template) {
  this.name = name;
  this.template = template;
};

var panes = [
  new Pane('currentTab', currentTab),
];


