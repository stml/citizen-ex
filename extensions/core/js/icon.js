var CxIcon = function(browser, blank, local, remote, full) {
  this.browser = browser;
  this.blank = blank;
  this.local = local;
  this.remote = remote;
  this.full = full;
};

CxIcon.prototype.setIcon = function(iconType, tab) {
  if (this.browser.chrome()) {
    chrome.browserAction.setIcon({ path: this[iconType] });
  } else if (this.browser.safari()) {
    var iconUri = safari.extension.baseURI + this[iconType];
    safari.extension.toolbarItems[0].image = iconUri;
  } else if (this.browser.firefox()) {
    // should specify the tab
    var iconUrl = self.data.url(this[iconType]);
    var tab = 'tab';
    if (typeof this.tabData === 'object') {
      tab = this.tabData;
    }
    button.state(tab, {
      disabled: false,
      icon: {
        '16': iconUrl
      }
    });
  }
};

CxIcon.prototype.addTabData = function(tab) {
  this.tabData = tab;
}
