var CxIcon = function(browser, blank, local, remote, full) {
  this.browser = browser;
  this.blank = blank;
  this.local = local;
  this.remote = remote;
  this.full = full;
};

CxIcon.prototype.setIcon = function(iconType, tabId) {
  if (this.browser.chrome()) {
    chrome.browserAction.setIcon({ path: this[iconType] });
  } else if (this.browser.safari()) {
    var iconUri = safari.extension.baseURI + this[iconType];
    safari.extension.toolbarItems[0].image = iconUri;
  } else if (this.browser.firefox()) {
    var iconUrl = self.data.url(this[iconType]);

    _.each(tabs, function(enumTab) {
      if (enumTab.id === tabId) {
        button.state(enumTab, {
          disabled: false,
          icon: {
            '16': iconUrl
          }
        });
      }
    })
  }
};
