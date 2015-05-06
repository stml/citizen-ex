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
    console.log('clicked the toolbar button');
  }
});

tabs.on('ready', function(tab) {
  var worker = tab.attach({
    contentScriptFile: [
      self.data.url('./lib/underscore.js'),
      self.data.url('./lib/jquery.js'),
      self.data.url('./lib/backbone.js'),
      self.data.url('./panel/panel.js'),
    ],
    contentStyleFile: self.data.url('./panel/panel.css')
  });

  worker.port.on('ownGeoData', function(worker) {
    sendOwnGeoData(worker);
  });
  worker.port.on('activeTab', function(worker, tab) {
    sendActiveTab(worker, tab.url);
  });
  worker.port.on('allTabs', sendAllTabs);
  worker.port.on('countryLog', sendCountryLog);
  worker.port.on('allLogEntries', sendAllLogEntries);
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

