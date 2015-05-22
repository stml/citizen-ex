var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');

var globalWorker= {};
var messagingWorker;
var baseURI = self.data.url('./');

var button = buttons.ActionButton({
  id: 'openCxPanel',
  label: 'Citizen Ex',
  disabled: true,
  icon: {
    '16': './icon16.png'
  }
});

pageMod.PageMod({
  include: '*',
  contentStyleFile: [
    self.data.url('./panel/panel.css'),
    self.data.url('./page/page.css')
  ]
});

tabs.on('ready', function(tab) {
  var tabId = tab.id;

  var worker = tab.attach({
    contentScriptFile: [
      self.data.url('./lib/underscore.js'),
      self.data.url('./lib/jquery.js'),
      self.data.url('./lib/backbone.js'),
      self.data.url('./lib/mapbox.js'),
      self.data.url('./lib/moment.js'),
      self.data.url('./panel/panel.js'),
      self.data.url('./page/page.js')
    ],
    contentScriptOptions: {
      'baseURI': baseURI
    }
  });
  messagingWorker = worker;
  globalWorker[tab.id] = worker;
  var message = new CxMessage(browser, worker);

  button.state(tab, {
    disabled: false
  });

  button.on('click', function(state) {
    var tabId = tab.id;
    var worker = tabs.activeTab.attach({
      contentScriptFile: self.data.url('./panel/panel_trigger.js'),
    });
    worker.port.on('openCxPanel', function() {
      if (globalWorker[tabId]) {
        globalWorker[tabId].port.emit('openCxPanel', tabs.activeTab.id);
      }
    });
  })

  utils.createLogEntry(tab.url, tabId);

  tab.on('ready', function(tab) {
    button.state(tab, {
      disabled: false
    });
  });

  tab.on('activate', function(tab) {
    button.state(tab, {
      disabled: false
    });
    utils.updateLogEntry(tab.url);
  });

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
  worker.port.on('requestTabId', function() {
    sendTabId(worker, tabId);
  });
  worker.port.on('eraseData', function() {
    eraseData(worker);
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

var sendTabId = function(worker, tabId) {
  worker.port.emit('tabId', tabId)
};

var eraseData = function(worker) {
  _.each(ss.storage, function(value, key) {
    delete ss.storage[key];
  });
  utils.reset();
};


