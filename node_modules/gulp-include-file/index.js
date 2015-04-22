var es = require('event-stream');
var PluginError = require('gulp-util').PluginError;
var fs = require('fs');

module.exports = function (options) {
  options = options || {};

  var pluginName = 'gulp-include-file';
  var regex = options.regex || /INCLUDE_FILE\s*\(\s*['"]([^'"]*)['"]\s*\)/m;
  var transform = options.transform || JSON.stringify;

  return es.map(function (file, callback) {
    if (file.isNull()) {
      return;
    }

    if (file.isStream()) {
      return this.emit(
        'error',
        new PluginError(pluginName, 'Cannot use streamed files')
      );
    }

    if (file.isBuffer()) {
      var contents = file.contents.toString('utf8');
      var matches;
      while (matches = regex.exec(contents)) {
        var path = file.base + matches[1];

        if (fs.existsSync(path)) {
          var include_contents = fs.readFileSync(path, {encoding: 'utf8'});
          contents = contents.substr(0, matches.index) +
            transform(include_contents) +
            contents.substr(matches.index + matches[0].length);
        } else {
          return this.emit(
            'error',
            new PluginError(pluginName, "File not found: " + path)
          );
        }
      }
      file.contents = new Buffer(contents);
    }
    callback(null, file);
  });
};
