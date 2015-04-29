// options/init_shared.js

var browser = new Browser();
var storage = new CxStorage(browser);
var message = new CxMessage(browser);

var optionsTemplate = INCLUDE_FILE('../../templates/html/options_template.html');

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

var options = new Options(browser, timeframes);
var optionsPage = new OptionsPage({ model: options, template: optionsTemplate });


console.log(options);


