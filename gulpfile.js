var gulp = require('gulp');
var concat = require('gulp-concat');
var include_file = require('gulp-include-file');

var images = [
  './extensions/templates/images/*.*'
];

var cssSources = [
 './extensions/templates/css/overwrite_warning.css',
 './extensions/templates/css/injected.css',
 './extensions/templates/css/leaflet.css'
];

var chromeInit = [
  './extensions/core/js/chrome/utils.js',
  './extensions/core/js/chrome/init.js'
];

var safariInit = [
  './extensions/core/js/safari/utils.js',
  './extensions/core/js/safari/init.js'
];

var coreSources = [
  './extensions/templates/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/utils.js',
  './extensions/core/js/log_entry.js',
  './extensions/core/js/geo_cache.js',
  './extensions/core/js/country_log.js',
  './extensions/core/js/shared_init.js'
];

var templateSources = [
  './extensions/templates/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/message.js',
  './extensions/templates/js/log_entry.js',
  './extensions/templates/js/sidebar.js',
  './extensions/templates/js/sidebar_pane.js',
  './extensions/templates/js/init_shared.js'
];

var chromeCore = coreSources.concat(chromeInit);
var safariCore = coreSources.concat(safariInit);

var chromeTemplates = templateSources.concat(['./extensions/templates/js/init_chrome.js']);
var safariTemplates = templateSources.concat(['./extensions/templates/js/init_safari.js']);

gulp.task('chromeImages', function () {
  gulp.src(images)
    .pipe(gulp.dest('./extensions/chrome/images/'));
});

gulp.task('chromeCss', function () {
  gulp.src(cssSources)
    .pipe(concat('browserAction.css'))
    .pipe(gulp.dest('./extensions/chrome/injected/'));
});

gulp.task('chromeLib', function () {
  gulp.src(['./extensions/core/lib/*'])
    .pipe(gulp.dest('./extensions/chrome/lib'));
});

gulp.task('chromeCore', function () {
  gulp.src(chromeCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/chrome/'));
});

gulp.task('chromeTemplates', function () {
  gulp.src(chromeTemplates)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/chrome/injected/'));
});

gulp.task('safariImages', function () {
  gulp.src(images)
    .pipe(gulp.dest('./extensions/safari.safariextension/images/'));
});

gulp.task('safariCss', function () {
  gulp.src(cssSources)
    .pipe(concat('browserAction.css'))
    .pipe(gulp.dest('./extensions/safari.safariextension/injected/'));
});

gulp.task('safariLib', function () {
  gulp.src(['./extensions/core/lib/*'])
    .pipe(gulp.dest('./extensions/safari.safariextension/lib'));
});

gulp.task('safariCore', function () {
  gulp.src(safariCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/'));
});

gulp.task('safariTemplates', function () {
  gulp.src(safariTemplates)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/injected/'));
});

gulp.task('watch', function() {
  gulp.watch(['./extensions/templates/**/*.*', './extensions/core/**/*.js'], ['chromeCore', 'chromeTemplates', 'chromeLib', 'chromeCss', 'chromeImages', 'safariCore', 'safariTemplates', 'safariLib', 'safariCss', 'safariImages']);
});

gulp.task('default', ['chromeCore', 'chromeTemplates', 'chromeLib', 'chromeCss', 'chromeImages', 'safariCore', 'safariTemplates', 'safariLib', 'safariCss', 'safariImages', 'watch']);
