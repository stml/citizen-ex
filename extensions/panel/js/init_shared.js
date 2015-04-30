// panel/js/init_shared.js

var panelTemplate = INCLUDE_FILE('../html/cx_panel.html');

var browser = new Browser();
var storage = new CxStorage(browser);
var message = new CxMessage(browser);

var cxPanel;
var cxPanelView;
