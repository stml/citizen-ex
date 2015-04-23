var Storage = function() {

};

Storage.prototype.set = function(property, value) {
  chrome.storage.local.set({ property: value });
};

Storage.prototype.get = function(property, callback) {
  chrome.storage.local.get(property, callback);
};
