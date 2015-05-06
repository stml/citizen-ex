// panel/js/init_firefox.js

self.port.on('hello', function(message) {
  console.log(message)
  self.port.emit('gotMessage', message);
});

cxPanel = new CxPanel(browser);
cxPanelView = new CxPanelView({ model: cxPanel, template: panelTemplate });
