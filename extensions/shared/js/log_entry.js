// shared/js/log_entry.js

var LogEntry = function() {};

LogEntry.prototype.fromJSON = function(json) {
  var that = this;
  _.each(json, function(value, key) {
    that[key] = value;
  });
  return this;
};

LogEntry.prototype.latestTimestamp = function() {
  var latest = _.max(this.timestamps, function(timestamp) {
    return Date.parse(timestamp);
  });
  return Date.parse(latest);
};
