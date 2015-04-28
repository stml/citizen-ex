/*
 * DO NOT EDIT THIS FILE
 *
 * It will be automatically generated from
 * templates defines in ./gulpfile.js
 * any time the templates are updated
 *
 */

var Browser = function() {
  this.name = 'unknown';
  var notChrome = _.isUndefined(window.chrome);
  if (!notChrome) {
    this.name = 'chrome';
  } else {
    this.name = 'safari';
  }
};

Browser.prototype.chrome = function() {
  return this.name === 'chrome';
};

Browser.prototype.safari = function() {
  return this.name === 'safari';
};

var CxStorage = function(browser) {
  this.browser = browser;
};

CxStorage.prototype.set = function(property, value) {
  if (!property) {
    return;
  }

  var json = JSON.prune(value);
  if (this.browser.chrome()) {
    chrome.storage.local.set({ property: json });
  } else if (this.browser.safari()) {
    localStorage[property] = json;
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.get = function(property, callback) {
  if (this.browser.chrome()) {
    chrome.storage.local.get(property, function(result) {
      var data = undefined;
      if (result[property]) {
        var data = JSON.parse(result[property]);
      }
      callback(data);
    });
  } else if (this.browser.safari()) {
    var data = undefined;
    if (localStorage[property]) {
      var data = JSON.parse(localStorage[property]);
    }
    callback(data);
  } else {
    throw 'Unknown browser';
  }
};

CxStorage.prototype.clear = function() {
  if (this.browser.chrome()) {
    chrome.storage.local.clear();
  } else if (this.browser.safari()) {
    localStorage.clear();
  } else {
    throw 'Unknown browser';
  }
};

var CxMessage = function(browser) {
  this.browser = browser;
};

CxMessage.prototype.send = function(message) {
  if (this.browser.chrome()) {
    chrome.runtime.sendMessage(message);
  } else if (this.browser.safari()) {

    var key;

    _.each(message, function (v, k) {
      if (v) {
        key = k;
      }
    });
    safari.self.tab.dispatchMessage(key, message, false);
  } else {
    throw 'Unknown browser';
  }
};


var LogEntry = function() {};

LogEntry.prototype.fromJSON = function(json) {
  var that = this;
  _.each(json, function(value, key) {
    that[key] = value;
  });
  return this;
};

LogEntry.prototype.latestTimestamp = function() {
  return _.max(this.timestamps, function(timestamp) {
    return Date.parse(timestamp).value;
  });
};

var Sidebar = Backbone.Model.extend({
  initialize: function(panes, browser) {
    this.panes = panes;
    this.browser = browser;
    this.resetValues();
    this.getOwnGeoData();
    this.getAllLogEntries();
    this.getLogEntryForTab();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    message.send({ countryLog: true });
  },

  receiveCitizenship: function(countryLog) {
    var countryCodes = _.pick(countryLog.visits, _.identity);
    var citizenship = this.calculateCitizenship(countryCodes);
    this.set({ citizenship: citizenship });
  },

  setUpOpenTabsCitizenship: function() {
    var tabEntries = this.get('tabEntries');
    var validEntries = _.reject(tabEntries, function(entry) {
      return entry.countryCode === undefined || entry.countryCode === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry.countryCode;
    });
    var openTabsCitizenship = this.calculateCitizenship(countryCodes);
    this.set({ openTabsCitizenship: openTabsCitizenship });
  },

  calculateCitizenship: function(countryCodes) {
    var sum = _.reduce(countryCodes, function(memo, num) { return memo + num; }, 0);
    var countries = [];
    _.each(countryCodes, function(value, key) {
      var percentage = (value / sum) * 100;
      percentage = percentage.toFixed(2);
      countries.push({ code: key, percentage: percentage });
    });
    countries = _.sortBy(countries, 'percentage');

    return countries.reverse();
  },

  getCitizenshipForDays: function(n) {
    var entries = this.getTabEntriesForDays(n);
    var countryCodes = this.getCountryCodesFromEntries(entries);
    var citizenship = this.calculateCitizenship(countryCodes);
    return citizenship;
  },

  getCountryCodesFromEntries: function(entries) {
    var validEntries = _.reject(entries, function(entry) {
      return entry.countryCode === undefined || entry.countryCode === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry.countryCode;
    });
    return countryCodes;
  },

  getAllLogEntries: function() {
    message.send({ allLogEntries: true });
  },

  receiveAllLogEntries: function(entries) {
    var logEntries = _.map(entries, function(entry) {
      var logEntry = new LogEntry();
      return logEntry.fromJSON(entry);
    });

    if (!logEntries) {
      this.set({ logEntries: '' });
    } else {
      this.set({ logEntries: logEntries });
    }
  },

  getLogEntry: function(url) {
    var logEntries = this.get('logEntries');

    if (!logEntries) {
      return null;
    }

    var entries = _.filter(logEntries, function(logEntry) {
      return logEntry.url === url;
    });
    latestEntry = _.max(entries, function(entry) {
      return _.max(entry.timestamps);
    });
    return latestEntry;
  },

  getLogEntryForTab: function() {
    message.send({ activeTab: true });
  },

  receiveActiveTab: function(url) {
    var entry = this.getLogEntry(url);

    if (!entry) {
      this.set({ entry: '' });
      return;
    } else {
      this.set({ entry: entry });
    }
  },

  getOwnGeoData: function() {
    // we can’t get it from storage (not shared)
    // we have to fetch it using the messaging system
    message.send({ ownGeoData: true });
  },

  receiveOwnGeoData: function(ownGeoData) {
    this.set({ ownGeoData: ownGeoData });
  },

  requestOpenTabs: function() {
    message.send({ allTabs: true });
  },

  updateTabs: function(urls) {
    this.set({ tabs: urls });
    this.getTabEntries();
  },

  getTabEntries: function() {
    var tabs = this.get('tabs');

    if (tabs) {
      var entries = [];
      _.each(tabs, _.bind(function(tabUrl) {
        var logEntry = this.getLogEntry(tabUrl);
        if (logEntry) {
          entries.push(logEntry);
        }
      }, this));
      this.set({ tabEntries: entries });
      this.setUpOpenTabsCitizenship();
    } else {
      this.set({ tabEntries: [] });
    }
  },

  getTabEntriesForDays: function(n) {
    var tabEntries = this.get('tabEntries');
    var cutOffDate = moment().subtract(n, 'days').valueOf();
    var latestEntries = _.filter(tabEntries, function(entry) {
      return entry.latestTimestamp() <= cutOffDate;
    });
    return latestEntries;
  },

  activatePane: function(name) {
    var pane = _.find(this.panes, function(pane) {
      return pane.name === name;
    });
    this.set({ activePane: pane });
  },

  toggle: function() {
    if (this.has('activePane')) {
      this.close();
    } else {
      this.open();
    }
  },

  open: function() {
    this.set({ activePane: this.panes[0] });
  },

  close: function() {
    this.unset('activePane');
  },

  resetValues: function() {
    this.set({ citizenship: [] });
    this.set({ ownGeoData: '' });
    this.set({ entry: '' });
    this.unset('logEntries');
    this.unset('tabs');
    this.unset('tabEntries');
  },

  eraseData: function() {
    this.resetValues();
    storage.clear();
  }
});



var SidebarPane = Backbone.View.extend({
  tagName: 'div',

  className: 'citizen-ex__pane',

  events: {
    'click .erase': 'eraseData',
    'click a': 'togglePane'
  },

  initialize: function(options) {
    this.name = options.name;
    this.template = _.template(options.template);

    this.listenTo(this.model, 'change:activePane', function(model, pane) {
      this.render(model, pane);
    });
    this.listenTo(this.model, 'change:entry', function(model, logEntry) {
      this.model.setUpCitizenship();
      this.render(model, this.model.get('activePane'));
    });
    this.listenTo(this.model, 'change:citizenship', function(model, citizenship) {
      this.render(model, this.model.get('activePane'));
    });
    this.listenTo(this.model, 'change:ownGeoData', function(model, ownGeoData) {
      this.render(model, this.model.get('activePane'));
    });

    this.appendToBody();
  },

  render: function(model, pane) {
    if (pane) {
      switch (pane.name) {
        case this.name:
          this.$el.html(this.template(this.model.toJSON()));
          this.$el.slideDown();
          break;
        default:
          this.$el.slideUp();
          break;
      }
    } else {
      this.$el.slideUp();
    }
  },

  appendToBody: function() {
    var body = $('body');
    this.$el.appendTo(body);
  },

  togglePane: function(event) {
    event.preventDefault();
    var paneName = event.currentTarget.name;
    this.model.activatePane(paneName);
  },

  eraseData: function(event) {
    event.preventDefault();
    this.model.eraseData();
  }

});


// templates/js/init_shared.js

var currentTab = "<div id=\"cex_hud\">\n\n\t<div id=\"cex_header\">\n\t\t<img id=\"cex_logo\" src=\"\" width=\"107\" height=\"24\" />\n\t\t<a href=\"#\" class=\"cex_more\" name=\"more\">More Info</a>\n\t\t<img id=\"cex_close\" src=\"\" width=\"24\" height=\"24\" />\n\t\t<script type=\"text/javascript\">\n            if (!_.isUndefined(window.chrome)) {\n              $('#cex_header #cex_logo').attr('src',chrome.extension.getURL('images/logo-small-white.svg'));\n              $('#cex_header #cex_close').attr('src',chrome.extension.getURL('images/close.png'));\n            } else if (safari) {\n              $('#cex_header #cex_logo').attr('src',safari.extension.baseURI + 'images/logo-small-white.svg');\n              $('#cex_header #cex_close').attr('src',safari.extension.baseURI + 'images/close.png');\n            }\n\t\t</script>\n\t</div>\n\n\t<div id=\"cex_main\">\n\n\t<% if (entry) { %>\n\n\t  \t<div id=\"cex_badge\">\n\n\t  \t\t<div id=\"cex_badge_column\">\n\n\t\t\t\t<% if (citizenship.length > 0) { %>\n\n\t\t\t\t<h2>This is your Algorithmic Citizenship</h2>\n\n\t\t\t\t<canvas id=\"cex_badge_canvas\"></canvas>\n\n\t\t\t\t<p id=\"cex_whatmeans\"><a href=\"http://citizen-ex.com/citizenship/\" target=\"_blank\">What does this mean?</a></p>\n\t\t\t\t<ul id=\"cex_sharebuttons\">\n\t\t\t\t\t<li>Share:</li>\n\t\t\t\t\t<li><a href=\"#\" class=\"cex_share_facebook\">Facebook</a></li>\n\t\t\t\t\t<li><a href=\"#\" class=\"cex_share_twitter\">Twitter</a></li>\n\t\t\t\t\t<li><a href=\"#\" class=\"cex_share_email\">Email</a></li>\n\t\t\t\t</ul>\n\n\t\t\t</div><!-- cex_badge_column -->\n\n\t\t\t<div id=\"cex_data_column\">\n\n\t\t\t\t<table id=\"distribution_table\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class=\"thead cex_country\">Your distribution</td>\n\t\t\t\t\t\t<td class=\"thead cex_percentage\">%</td>\n\t\t\t\t\t</tr>\n\t\t\t\t<% _.each(citizenship, function(country) { %>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class=\"cex_country\"><%= country.code %></td>\n\t\t\t\t\t\t<td class=\"cex_percentage\"><%= country.percentage %></td>\n\t\t\t\t\t</tr>\n\t\t\t\t<% }); %>\n\t\t\t\t</table>\n\n\t\t\t</div><!-- cex_data_column -->\n\n\t\t\t<script type=\"text/javascript\">\n\t\t\t\tvar percents = [\n\t\t\t\t<% _.each(citizenship, function(country) { %>\n\t\t\t\t  [\"<%= country.code %>\",<%= country.percentage %>],\n\t\t\t\t  <% }); %>];\n\t\t\t\t\t// set canvas to css heights\n\t\t\t\t$('#cex_badge_canvas').attr('width', parseInt($('#cex_badge_canvas').css('width')));\n\t\t\t\t$('#cex_badge_canvas').attr('height', parseInt($('#cex_badge_canvas').css('height')));\n\n\t\t\t\tvar badge = $(\"#cex_badge_canvas\").get(0).getContext(\"2d\");\n\n\t\t\t\t// circle centre and radius\n\t\t\t\tvar x0 = $('#cex_badge_canvas').attr('width')/2;\n\t\t\t\tvar y0 = $('#cex_badge_canvas').attr('height')/2;\n\t\t\t\tvar r = Math.min($('#cex_badge_canvas').attr('height')/2,$('#cex_badge_canvas').attr('width')/2);\n\n\t\t\t\tvar circlepointer = 0;\n\n\t\t\t\t$.each(percents, function() {\n\t\t\t\t\tvar country = this[0];\n\t\t\t\t\tvar value = this[1];\n\t\t\t\t\tvar degrees = 360*(value/100);\n\t\t\t\t\tdrawSegment(badge,x0,y0,r,circlepointer,country,degrees);\n\t\t\t\t\tcirclepointer = circlepointer + degrees;\n\t\t\t\t\t});\n\n\t\t\t\tfunction drawSegment(badge,x0,y0,r,circlepointer,country,degrees) {\n\t\t\t\t\tvar img = new Image();\n\t\t\t\t\timg.onload = function() {\n\t\t\t\t\t\tvar flagscaledheight = badge.canvas.clientHeight;\n\t\t\t\t\t\tvar flagscaledwidth = flagscaledheight*(img.width/img.height);\n\t\t\t\t\t\tvar flagmargin = (flagscaledwidth - badge.canvas.clientWidth) / 2;\n\t\t\t\t\t\tvar svgCanvas = document.createElement(\"canvas\");\n\t\t\t\t    \tsvgCanvas.height = flagscaledheight;\n\t\t\t\t    \tsvgCanvas.width = flagscaledwidth;\n\t\t\t\t    \tvar svgCtx = svgCanvas.getContext(\"2d\");\n\t\t\t\t    \tsvgCtx.drawImage(img, -flagmargin, 0, flagscaledwidth, flagscaledheight);\n\t\t\t\t    \tvar pattern = badge.createPattern(svgCanvas, 'repeat');\n\t\t\t\t    \tbadge.fillStyle = pattern;\n\t\t\t\t\t\tbadge.beginPath();\n\t\t\t\t\t\tbadge.moveTo(x0, y0);\n\t\t\t\t\t\tvar xy = circleCoords(x0,y0,r,circlepointer);\n\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\tfor (i = 0; i < degrees; i=i+20) {\n\t\t\t\t\t\t\txy = circleCoords(x0,y0,r,circlepointer+i);\n\t\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\txy = circleCoords(x0,y0,r,circlepointer+degrees);\n\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\tbadge.closePath();\n\t\t\t\t\t\tbadge.lineWidth=1;\n\t\t\t\t\t\tbadge.strokeStyle=\"#888\";\n\t\t\t\t\t\tbadge.stroke();\n\t\t\t\t\t\tbadge.fill();\n\t\t\t\t      \t};\n                      if (!_.isUndefined(window.chrome)) {\n                        img.src = chrome.extension.getURL('flags/'+country+'.svg');\n                      } else if (safari) {\n                        img.src = safari.extension.baseURI + 'flags/'+country+'.svg';\n                      }\n\t\t\t\t\t}\n\n\t\t\t\tfunction circleCoords(x0,y0,r,theta) {\n\t\t\t\t\tvar x = x0 + r * Math.cos(theta * Math.PI / 180);\n\t\t\t\t\tvar y = y0 + r * Math.sin(theta * Math.PI / 180);\n\t\t\t\t\treturn [x,y];\n\t\t\t\t\t}\n\n\t\t\t</script>\n\n\t\t</div><!-- cex_badge -->\n\n\t\t\t\t<% } else { %>\n\t\t\t\t  <h2>No Citizenship data available yet. Keep browsing!</h2>\n\t\t\t\t<% }; %>\n\n\t\t<div id=\"cex_map\">\n\n\t\t<div id=\"cex_map_window\" class=\"dark\">\n\t\t\t<img id=\"cex_map_loading\" src=\"\" alt=\"Loading\"/>\n\t\t\t<!-- Add mapbox watermark -->\n  \t\t\t<a href=\"http://mapbox.com/about/maps\" class='mapbox-maplogo' target=\"_blank\">MapBox</a>\n  \t\t</div>\n\n\t  \t<script type=\"text/javascript\">\n        if (!_.isUndefined(window.chrome)) {\n          $('img#cex_map_loading').attr('src',chrome.extension.getURL('images/loading.gif'));\n        } else if (safari) {\n          $('img#cex_map_loading').attr('src',safari.extension.baseURI + 'images/loading.gif');\n        }\n\t  \tsetTimeout(function(){ cex_drawMap(); }, 1000);\n\t  \tfunction cex_drawMap() {\n\t\t\tvar cexmap = L.map('cex_map_window', { zoomControl:false });\n\t\t\tvar cextilelayer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/stml.l6086pbg/{z}/{x}/{y}.png', {\n\t\t\t\tattribution: '<a href=\"http://openstreetmap.org/copyright\">Map data: © OpenStreetMap</a>'}).addTo(cexmap);\n\t\t\tcextilelayer.on('tileerror', function(error, tile) {\n\t\t\t    console.log(error);\n\t\t\t    console.log(tile);\n\t\t\t\t});\n\t\t\tcexmap.attributionControl.setPrefix(\"\");\n\t\t\tcexmap.setView([0,0],2);\n            var yellowMarker;\n            var cyanMarker;\n\n            if (!_.isUndefined(window.chrome)) {\n              cyanMarker = chrome.extension.getURL('images/map-marker-cyan.png');\n              yellowMarker = chrome.extension.getURL('images/map-marker-yellow.png');\n            } else if (safari) {\n              cyanMarker = safari.extension.baseURI + 'images/map-marker-cyan.png';\n              yellowMarker = safari.extension.baseURI + 'images/map-marker-yellow.png';\n            }\n\n\t\t\tvar destIcon = L.icon({\n\t\t\t\ticonUrl: yellowMarker,\n\t\t\t\ticonSize:     [41,41], // size of the icon\n\t\t\t\ticonAnchor:   [20,20], // point of the icon which will correspond to marker's location\n\t\t\t\t});\n\t\t\tvar origIcon = L.icon({\n\t\t\t\ticonUrl: cyanMarker,\n\t\t\t\ticonSize:     [41,41], // size of the icon\n\t\t\t\ticonAnchor:   [20,20], // point of the icon which will correspond to marker's location\n\t\t\t\t});\n\n\t\t\t<% if (ownGeoData && entry.lat && entry.lng) { %>\n\t\t\t\tvar cexmarkerline = L.polyline([[<%= ownGeoData.ownLat %>, <%= ownGeoData.ownLng %>],[<%= entry.lat %>, <%= entry.lng %>]], { color: '#fff', weight: 1, opacity: 1 }).addTo(cexmap);\n\t\t\t<% } %>\n\n\t\t\tvar cexmarkergroup = new L.featureGroup();\n\t\t\t<% if (ownGeoData && ownGeoData.ownIp) { %>\n\t\t\t\tvar origMarker = L.marker([<%= ownGeoData.ownLat %>, <%= ownGeoData.ownLng %>], {icon: origIcon}).addTo(cexmap);\n\t\t\t\tcexmarkergroup.addLayer(origMarker);\n\t\t\t<% } else { %>\n\t\t    <% }; %>\n\t\t\t<% if (entry.ip) { %>\n\t\t\t\tvar destMarker = L.marker([<%= entry.lat %>, <%= entry.lng %>], {icon: destIcon}).addTo(cexmap);\n\t\t\t\tcexmarkergroup.addLayer(destMarker);\n\t\t    <% } else { %>\n\n\t\t    <% }; %>\n\t\t    cexmap.fitBounds(cexmarkergroup.getBounds(), {padding: [50,50]});\n\t\t    // kill loading circle\n\t\t    $('img#cex_map_loading').hide();\n\t\t    }\n\n\t  \t</script>\n\n\t    \t\t<div id=\"cex_mapdata\">\n\n\t    \t\t\t<div id=\"cex_dest_column\">\n\t    \t\t\t\t<h3>Current remote location</h3>\n\t\t\t\t\t    <% if (entry.ip) { %>\n\t\t\t\t\t      <p><strong><% if (entry.city.length > 0) { %><%= entry.city %>, <% } %><%= entry.countryCode %></strong></p>\n\t\t\t\t\t      <p>IP Address: <%= entry.ip %></p>\n\t\t\t\t\t      <p>Lat: <%= entry.lat %> / Lon: <%= entry.lng %></p>\n\t\t\t\t\t    <% } else { %>\n\t\t\t\t\t      <p><strong>Remote location is unknown</strong></p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t    <% }; %>\n\t\t\t\t    </div><!-- cex_dest_column -->\n\t\t\t\t    <div id=\"cex_orig_column\">\n\t    \t\t\t\t<h3>Your tracked location</h3>\n\t\t\t\t\t    <% if (ownGeoData && ownGeoData.ownIp) { %>\n\t\t\t\t\t      <p><strong><% if (ownGeoData.ownCity.length > 0) { %><%= ownGeoData.ownCity %>, <% } %><%= ownGeoData.ownCountryCode %></p>\n\t\t\t\t\t      <p>IP Address: <%= ownGeoData.ownIp %></p>\n\t\t\t\t\t      <p>Lat: <%= ownGeoData.ownLat %> / Lon: <%= ownGeoData.ownLng %></p>\n\t\t\t\t\t    <% } else { %>\n\t\t\t\t\t      <p><strong>Your location is unknown</strong></p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t    <% }; %>\n\t\t\t\t    </div><!-- cex_orig_column -->\n\t\t\t\t</div><!-- cex_mapdata -->\n\n\t    </div><!-- cex_map -->\n\n\t  <% } else { %>\n\n\t  \t\t<div id=\"cex_nodata\">\n\t\t\t\t<p>No data available yet.</p>\n\t\t\t</div>\n\t  <% }; %>\n\n\t</div><!-- #cex_main -->\n\n</div><!-- #cex_hud -->\n";
var about = "<h1>About</h1>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"settings\">Settings</a>\n";
var settings = "<h1>Settings</h1>\n<a href=\"#\" class=\"erase\">Erase all data (cannot undo this action)</a>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"about\">About</a>\n\n\n";

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

// templates/js/init_safari.js

var sidebar = false;

safari.self.addEventListener('message', function(message) {

  if (message.name === 'tabs') {
    sidebar.updateTabs(message.message.tabs);
  } else if (message.name === 'activeTab') {
    sidebar.receiveActiveTab(message.message.activeTab);
  } else if (message.name === 'allLogEntries') {
    sidebar.receiveAllLogEntries(message.message.allLogEntries);
  } else if (message.name === 'countryLog') {
    sidebar.receiveCitizenship(message.message.countryLog);
  } else if (message.name === 'ownGeoData') {
    sidebar.receiveOwnGeoData(message.message.ownGeoData);
  }

  if (sidebar) {
    return;
  }

  sidebar = new Sidebar(panes, browser);
  _.each(panes, function(pane) {
    new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
  });

  // we fetch the last record again
  // as some of its request should have come back by now
  sidebar.getLogEntryForTab();

  // we toggle the main sidebar pane visibility
  if (message.name === 'openSidebar') {
    sidebar.toggle();
    sidebar.requestOpenTabs();
  }

}, false);
