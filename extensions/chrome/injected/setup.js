/*
 * DO NOT EDIT THIS FILE
 *
 * It will be automatically generated from
 * templates defines in ./gulpfile.js
 * any time the templates are updated
 *
 */

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
  initialize: function(panes) {
    this.panes = panes;
    this.resetValues();
    this.getOwnGeoData();
    this.getAllLogEntries();
    this.getLogEntryForTab();
    this.setUpCitizenship();
  },

  setUpCitizenship: function() {
    chrome.runtime.sendMessage({ countryLog: true }, _.bind(function(countryLog) {
      var countryCodes = _.pick(countryLog.visits, _.identity);
      var citizenship = this.calculateCitizenship(countryCodes);
      this.set({ citizenship: citizenship });
    }, this));
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
    chrome.runtime.sendMessage({ allLogEntries: true }, _.bind(function(entries) {
      var logEntries = _.map(entries, function(entry) {
        var logEntry = new LogEntry();
        return logEntry.fromJSON(JSON.parse(entry));
      });

      if (!logEntries) {
        this.set({ logEntries: '' });
      } else {
        this.set({ logEntries: logEntries });
      }
    }, this));
  },

  getLogEntry: function(url, tabId, windowId) {
    var logEntries = this.get('logEntries');

    if (!logEntries) {
      return null;
    }

    var entry = _.find(logEntries, function(logEntry) {
      return logEntry.url === url && logEntry.tabId === tabId && logEntry.windowId === windowId;
    });
    return entry;
  },

  getLogEntryForTab: function() {
    chrome.runtime.sendMessage({ activeTab: true }, _.bind(function(response) {
      var tab = response;
      var entry = this.getLogEntry(tab.url, tab.id, tab.windowId);

      if (!entry) {
        this.set({ entry: '' });
        return;
      } else {
        this.set({ entry: entry });
      }


    }, this));
  },

  getOwnGeoData: function() {
    chrome.storage.local.get('ownGeoData', _.bind(function(object) {
      this.set({ ownGeoData: object.ownGeoData });
    }, this));
  },

  requestOpenTabs: function() {
    chrome.runtime.sendMessage({ allTabs: true });
  },

  updateTabs: function(tabs) {
    this.set({ tabs: tabs });
    this.getTabEntries();
  },

  getTabEntries: function() {
    var tabs = this.get('tabs');

    if (tabs) {
      var entries = [];
      _.each(tabs, _.bind(function(tab) {
        var logEntry = this.getLogEntry(tab.url, tab.id, tab.windowId);
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
    chrome.storage.local.clear();
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


var currentTab = "<div id=\"cex_hud\">\n\n\t<div id=\"cex_header\">\n\t\t<h1>Citizen Ex</h1>\n\t\t<a href=\"#\" class=\"more\" name=\"more\">More Info</a>\n\t\t<a href=\"#\" class=\"close\" name=\"close\">Close</a>\n\t\t<script type=\"text/javascript\">\n\t\t\t$('#cex_header h1').css(\"height\",\"24px\");\n\t\t\t$('#cex_header h1').css(\"width\",\"107px\");\t\n\t\t\t$('#cex_header h1').css(\"text-indent\",\"-999999px\");\n\t\t\t$('#cex_header h1').css(\"background\",\"url('\"+chrome.extension.getURL('images/logo-small-white.svg')+\"') no-repeat\");\n\t\t\t$('#cex_header a.close').css(\"height\",\"24px\");\n\t\t\t$('#cex_header a.close').css(\"width\",\"24px\");\t\n\t\t\t$('#cex_header a.close').css(\"text-indent\",\"-999999px\");\n\t\t\t$('#cex_header a.close').css(\"background\",\"url('\"+chrome.extension.getURL('images/close.png')+\"') no-repeat\");\n\t\t</script>\n\t</div>\n\n\t<div id=\"cex_main\">\n\n\t<% if (entry) { %>\n\t\n\t  \t<div id=\"cex_badge\">\n\t  \t\n\t  \t\t<div id=\"cex_badge_column\">\n\t  \n\t\t\t\t<% if (citizenship.length > 0) { %>\n\t\t\t\t\n\t\t\t\t<h2>This is your Algorithmic Citizenship</h2>\n\t\t\t\t\n\t\t\t\t<canvas id=\"cex_badge_canvas\"></canvas>\n\t\t\t\t\n\t\t\t\t<table id=\"share_table\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td colspan=\"4\" class=\"cex_meaning\"><a href=\"#\" class=\"more\" name=\"more\">What does this mean?</a></td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class=\"title\">Share:</td>\n\t\t\t\t\t\t<td class=\"facebook\"><a href=\"#\" class=\"cex_share_facebook\">Facebook</a></td>\n\t\t\t\t\t\t<td class=\"twitter\"><a href=\"#\" class=\"cex_share_twitter\">Twitter</a></td>\n\t\t\t\t\t\t<td class=\"email\"><a href=\"#\" class=\"cex_share_email\">Email</a></td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\t\t\t\t<script type=\"text/javascript\">\n/*\n\t\t\t\t\t$('#share_table td.icon').css(\"height\",\"14px\");\n\t\t\t\t\t$('#share_table td.icon').css(\"width\",\"14px\");\n\t\t\t\t\t$('#share_table td.icon').css(\"text-indent\",\"-999999px\");\n\t\t\t\t\t$('#share_table td.facebook').css(\"background\",\"url('\"+chrome.extension.getURL('images/icon-facebook.png')+\"') no-repeat\");\n\t\t\t\t\t$('#share_table td.twitter').css(\"background\",\"url('\"+chrome.extension.getURL('images/icon-twitter.png')+\"') no-repeat\");\n\t\t\t\t\t$('#share_table td.email').css(\"background\",\"url('\"+chrome.extension.getURL('images/icon-email.png')+\"') no-repeat\");\n*/\n\t\t\t\t</script>\n\t\t\t\n\t\t\t</div><!-- cex_badge_column -->\n\t\t\t\n\t\t\t<div id=\"cex_data_column\">\n\t\t\t\t\n\t\t\t\t<table id=\"distribution_table\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class=\"thead country\">Your distribution</td>\n\t\t\t\t\t\t<td class=\"thead percentage\">%</td>\n\t\t\t\t\t</tr>\n\t\t\t\t<% _.each(citizenship, function(country) { %>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class=\"country\"><%= country.code %></td>\n\t\t\t\t\t\t<td class=\"percentage\"><%= country.percentage %></td>\n\t\t\t\t\t</tr>\n\t\t\t\t<% }); %>\n\t\t\t\t</table>\n\t\t\t\t\n\t\t\t</div><!-- cex_data_column -->\n\n\t\t\t<script type=\"text/javascript\">\n\t\t\t\tvar percents = [\n\t\t\t\t<% _.each(citizenship, function(country) { %>\n\t\t\t\t  [\"<%= country.code %>\",<%= country.percentage %>],\n\t\t\t\t  <% }); %>];\n\t\t\t\t\t// set canvas to css heights\n\t\t\t\t$('#cex_badge_canvas').attr('width', parseInt($('#cex_badge_canvas').css('width')));\n\t\t\t\t$('#cex_badge_canvas').attr('height', parseInt($('#cex_badge_canvas').css('height')));\n\t\t\t\t\n\t\t\t\tvar badge = $(\"#cex_badge_canvas\").get(0).getContext(\"2d\");\t\n\t\t\t\t\n\t\t\t\t// circle centre and radius\n\t\t\t\tvar x0 = $('#cex_badge_canvas').attr('width')/2;\n\t\t\t\tvar y0 = $('#cex_badge_canvas').attr('height')/2;\n\t\t\t\tvar r = Math.min($('#cex_badge_canvas').attr('height')/2,$('#cex_badge_canvas').attr('width')/2);\n\t\t\t\n\t\t\t\tvar circlepointer = 0;\n\t\t\t\t\n\t\t\t\t$.each(percents, function() {\n\t\t\t\t\tvar country = this[0];\n\t\t\t\t\tvar value = this[1];\n\t\t\t\t\tvar degrees = 360*(value/100);\n\t\t\t\t\tdrawSegment(badge,x0,y0,r,circlepointer,country,degrees);\n\t\t\t\t\tcirclepointer = circlepointer + degrees;\n\t\t\t\t\t});\n\t\t\t\t\t\n\t\t\t\tfunction drawSegment(badge,x0,y0,r,circlepointer,country,degrees) {\n\t\t\t\t\tvar img = new Image();\n\t\t\t\t\timg.onload = function() {\n\t\t\t\t\t\tvar flagscaledheight = badge.canvas.clientHeight;\n\t\t\t\t\t\tvar flagscaledwidth = flagscaledheight*(img.width/img.height);\n\t\t\t\t\t\tvar flagmargin = (flagscaledwidth - badge.canvas.clientWidth) / 2;\n\t\t\t\t\t\tvar svgCanvas = document.createElement(\"canvas\");\n\t\t\t\t    \tsvgCanvas.height = flagscaledheight;\n\t\t\t\t    \tsvgCanvas.width = flagscaledwidth;\n\t\t\t\t    \tvar svgCtx = svgCanvas.getContext(\"2d\");\n\t\t\t\t    \tsvgCtx.drawImage(img, -flagmargin, 0, flagscaledwidth, flagscaledheight);\n\t\t\t\t    \tvar pattern = badge.createPattern(svgCanvas, 'repeat');\n\t\t\t\t    \tbadge.fillStyle = pattern;\n\t\t\t\t\t\tbadge.beginPath();\n\t\t\t\t\t\tbadge.moveTo(x0, y0);\n\t\t\t\t\t\tvar xy = circleCoords(x0,y0,r,circlepointer);\n\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\tfor (i = 0; i < degrees; i=i+20) {\n\t\t\t\t\t\t\txy = circleCoords(x0,y0,r,circlepointer+i);\n\t\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\txy = circleCoords(x0,y0,r,circlepointer+degrees);\n\t\t\t\t\t\tbadge.lineTo(xy[0],xy[1]);\n\t\t\t\t\t\tbadge.closePath();\n\t\t\t\t\t\tbadge.lineWidth=1;\n\t\t\t\t\t\tbadge.strokeStyle=\"#888\";\n\t\t\t\t\t\tbadge.stroke();\n\t\t\t\t\t\tbadge.fill();\n\t\t\t\t      \t};\t\n\t\t\t\t    img.src = chrome.extension.getURL('flags/'+country+'.svg');\n\t\t\t\t\t}\t\n\t\t\t\t\t\n\t\t\t\tfunction circleCoords(x0,y0,r,theta) {\n\t\t\t\t\tvar x = x0 + r * Math.cos(theta * Math.PI / 180);\n\t\t\t\t\tvar y = y0 + r * Math.sin(theta * Math.PI / 180);\n\t\t\t\t\treturn [x,y];\t\n\t\t\t\t\t}\n\t\t\t\t\t\n\t\t\t</script>  \n\t\t\t\t\n\t\t</div><!-- cex_badge -->\n\t\t\t\t\t\t\t\t  \n\t\t\t\t<% } else { %>\n\t\t\t\t  <h2>No Citizenship data available yet. Keep browsing!</h2>\n\t\t\t\t<% }; %>\n\t\t\n\t\t<div id=\"cex_map\">\n\t\t\n\t\t<div id=\"cex_map_window\" class=\"dark\">\n\t\t\t<img id=\"cex_map_loading\" src=\"\" alt=\"Loading\"/>  \n\t\t\t<!-- Add mapbox watermark -->\n  \t\t\t<a href=\"http://mapbox.com/about/maps\" class='mapbox-maplogo' target=\"_blank\">MapBox</a>\n  \t\t</div>\n\t    \n\t  \t<script type=\"text/javascript\">\n\t  \t$('img#cex_map_loading').attr('src',chrome.extension.getURL('images/loading.gif'));\n\t  \tsetTimeout(function(){ cex_drawMap(); }, 1000);\n\t  \tfunction cex_drawMap() {\n\t\t\tvar cexmap = L.map('cex_map_window', { zoomControl:false });\n\t\t\tL.tileLayer('https://{s}.tiles.mapbox.com/v3/stml.l6086pbg/{z}/{x}/{y}.png', {\n\t\t\t\tattribution: '<a href=\"http://openstreetmap.org/copyright\">Map data: © OpenStreetMap</a>'}).addTo(cexmap);\n\t\t\tcexmap.attributionControl.setPrefix(\"\");\t\t\t\n\t\t\tcexmap.setView([0,0],2);\n\t\t\t\n\t\t\tvar destIcon = L.icon({\n\t\t\t\ticonUrl: chrome.extension.getURL('images/map-marker-yellow.png'),\t\n\t\t\t\ticonSize:     [41,41], // size of the icon\n\t\t\t\ticonAnchor:   [20,20], // point of the icon which will correspond to marker's location\n\t\t\t\t});\n\t\t\tvar origIcon = L.icon({\n\t\t\t\ticonUrl: chrome.extension.getURL('images/map-marker-cyan.png'),\t\n\t\t\t\ticonSize:     [41,41], // size of the icon\n\t\t\t\ticonAnchor:   [20,20], // point of the icon which will correspond to marker's location\n\t\t\t\t});\n\t\t\t\t\n\t\t\t<% if (ownGeoData && entry.lat && entry.lng) { %>\n\t\t\t\tvar cexmarkerline = L.polyline([[<%= ownGeoData.ownLat %>, <%= ownGeoData.ownLng %>],[<%= entry.lat %>, <%= entry.lng %>]], { color: '#fff', weight: 1, opacity: 1 }).addTo(cexmap);\n\t\t\t<% } %>\n\t\t\t\n\t\t\tvar cexmarkergroup = new L.featureGroup();\n\t\t\t<% if (ownGeoData && ownGeoData.ownIp) { %>\n\t\t\t\tvar origMarker = L.marker([<%= ownGeoData.ownLat %>, <%= ownGeoData.ownLng %>], {icon: origIcon}).addTo(cexmap);\n\t\t\t\tcexmarkergroup.addLayer(origMarker);\n\t\t\t<% } else { %>\n\t\t    <% }; %>\n\t\t\t<% if (entry.ip) { %>\n\t\t\t\tvar destMarker = L.marker([<%= entry.lat %>, <%= entry.lng %>], {icon: destIcon}).addTo(cexmap);\n\t\t\t\tcexmarkergroup.addLayer(destMarker);\n\t\t    <% } else { %>\n\t\t    \n\t\t    <% }; %>\n\t\t    cexmap.fitBounds(cexmarkergroup.getBounds(), {padding: [50,50]});\n\t\t    // kill loading circle\n\t\t    $('img#cex_map_loading').hide();\n\t\t    }\n\t    \n\t  \t</script>\n\t    \n\t    \t\t<div id=\"cex_mapdata\">\n\t    \t\t\n\t    \t\t\t<div id=\"cex_dest_column\">\n\t    \t\t\t\t<h3>Current remote location</h3>\n\t\t\t\t\t    <% if (entry.ip) { %>\n\t\t\t\t\t      <p><strong><% if (entry.city.length > 0) { %><%= entry.city %>, <% } %><%= entry.countryCode %></strong></p>\n\t\t\t\t\t      <p>IP Address: <%= entry.ip %></p>\n\t\t\t\t\t      <p>Lat: <%= entry.lat %> / Lon: <%= entry.lng %></p>\n\t\t\t\t\t    <% } else { %>   \n\t\t\t\t\t      <p><strong>Remote location is unknown</strong></p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t    <% }; %>\n\t\t\t\t    </div><!-- cex_dest_column -->\n\t\t\t\t    <div id=\"cex_orig_column\">\n\t    \t\t\t\t<h3>Your tracked location</h3>\n\t\t\t\t\t    <% if (ownGeoData && ownGeoData.ownIp) { %>\n\t\t\t\t\t      <p><strong><% if (ownGeoData.ownCity.length > 0) { %><%= ownGeoData.ownCity %>, <% } %><%= ownGeoData.ownCountryCode %></p>\n\t\t\t\t\t      <p>IP Address: <%= ownGeoData.ownIp %></p>\n\t\t\t\t\t      <p>Lat: <%= ownGeoData.ownLat %> / Lon: <%= ownGeoData.ownLng %></p>\n\t\t\t\t\t    <% } else { %>   \n\t\t\t\t\t      <p><strong>Your location is unknown</strong></p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t      <p>&nbsp;</p>\n\t\t\t\t\t    <% }; %>\n\t\t\t\t    </div><!-- cex_orig_column -->\n\t\t\t\t</div><!-- cex_mapdata -->\n\t    \n\t    </div><!-- cex_map -->\n\t    \n\t  <% } else { %>\n\t  \n\t  \t\t<div id=\"cex_nodata\">\n\t\t\t\t<p>No data available yet.</p>\n\t\t\t</div>\n\t  <% }; %>\n\t  \n\t</div><!-- #cex_main -->\n\n</div><!-- #cex_hud -->";
var about = "<h1>About</h1>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"settings\">Settings</a>\n";
var settings = "<h1>Settings</h1>\n<a href=\"#\" class=\"erase\">Erase all data (cannot undo this action)</a>\n<a href=\"#\" name=\"currentTab\">Current page</a>\n<a href=\"#\" name=\"about\">About</a>\n\n\n";

var Pane = function(name, template) {
  this.name = name;
  this.template = template;
};

var panes = [
  new Pane('currentTab', currentTab),
  new Pane('about', about),
  new Pane('settings', settings)
];

var sidebar = new Sidebar(panes);

_.each(panes, function(pane) {
  new SidebarPane({ name: pane.name, model: sidebar, template: pane.template });
});


