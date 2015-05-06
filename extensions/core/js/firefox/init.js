var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');

var button = buttons.ActionButton({
  id: 'openCxPanel',
  label: 'Citizen Ex',
  icon: {
    '16': './icon16.png'
  },
  onClick: function(state) {
    var worker = tabs.activeTab.attach({
      contentScriptFile: [
        self.data.url('./panel/panel_trigger.js')
      ],
    });
    worker.port.on('openCxPanel', function() {
      globalWorker.port.emit('openCxPanel', true);
    });
  }
});

pageMod.PageMod({
  include: '*',
  contentStyleFile: self.data.url('./panel/panel.css')
});

var globalWorker;
var baseURI = self.data.url('./');

tabs.on('ready', function(tab) {
  var worker = tab.attach({
    contentScriptFile: [
      self.data.url('./lib/underscore.js'),
      self.data.url('./lib/jquery.js'),
      self.data.url('./lib/backbone.js'),
      self.data.url('./panel/panel.js')
    ],
    contentScriptOptions: {
      'baseURI': baseURI
    }
  });
  globalWorker = worker;

  worker.port.on('ownGeoData', function() {
    sendOwnGeoData(worker);
  });
  worker.port.on('activeTab', function() {
    sendActiveTab(worker, tab.url);
  });
  worker.port.on('allTabs', function() {
    sendAllTabs(worker);
  });
  worker.port.on('countryLog', function() {
    sendCountryLog(worker);
  });
  worker.port.on('allLogEntries', function() {
    sendAllLogEntries(worker);
  });
  worker.port.on('openCxPanel', function() {
    console.log('opening the panel1');
  });
});

var sendOwnGeoData = function(worker) {
  worker.port.emit('ownGeoData', geoCache.getOwnLocation());
};

var sendActiveTab = function(worker, url) {
  worker.port.emit('activeTab', url)
};

var sendAllTabs = function(worker) {
  var urls = _.pluck(tabs, 'url');

  worker.port.emit('allTabs', urls);
};

var sendCountryLog = function(worker) {
  worker.port.emit('countryLog', countryLog);
};

var sendAllLogEntries = function(worker) {
  worker.port.emit('allLogEntries', logEntries);
};

