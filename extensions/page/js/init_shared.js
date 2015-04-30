// options/init_shared.js

var browser = new CxBrowser();
var storage = new CxStorage(browser);
var message = new CxMessage(browser);

var cxPageTemplate = INCLUDE_FILE('../../templates/html/cx_page_template.html');

var Timeframe = function(name, duration) {
  this.name = name;
  this.duration = duration;
};

var timeframes = [
  new Timeframe('all-time', null),
  new Timeframe('month', 30),
  new Timeframe('week', 7),
  new Timeframe('day', 1)
];

var cxPage = new cxPage(browser, timeframes);
var cxPageView = new CxPageView({ model: cxPage, template: cxPageTemplate });
