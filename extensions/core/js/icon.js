var CxIcon = function(browser, blank, local, remote, full) {
  this.browser = browser;
  this.blank = blank;
  this.local = local;
  this.remote = remote;
  this.full = full;
};

CxIcon.prototype.setIcon = function(iconType) {
  if (this.browser.chrome()) {
    chrome.browserAction.setIcon({ path: this[iconType] });
  } else if (this.browser.safari()) {
    var iconUri = safari.extension.baseURI + this[iconType];
    safari.extension.toolbarItems[0].image = iconUri;
  }
};
