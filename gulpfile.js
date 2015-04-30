var gulp = require('gulp');
var concat = require('gulp-concat');
var include_file = require('gulp-include-file');

var images = [
  './extensions/assets/images/*.*'
];

var page = [
  './extensions/page/html/cx_page.html'
];

var pageSources = [
  './extensions/shared/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/message.js',
  './extensions/shared/js/log_entry.js',
  './extensions/page/js/cx_page.js',
  './extensions/page/js/cx_page_view.js',
  './extensions/page/js/init_shared.js'
];

var cssSources = [
 './extensions/assets/css/overwrite_warning.css',
 './extensions/assets/css/injected.css',
 './extensions/assets/css/leaflet.css'
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
  './extensions/shared/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/utils.js',
  './extensions/core/js/log_entry.js',
  './extensions/core/js/geo_cache.js',
  './extensions/core/js/country_log.js',
  './extensions/core/js/shared_init.js'
];

var panelSources = [
  './extensions/shared/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/message.js',
  './extensions/shared/js/log_entry.js',
  './extensions/panel/js/cx_panel.js',
  './extensions/panel/js/cx_panel_view.js',
  './extensions/panel/js/init_shared.js'
];

var chromeCore = coreSources.concat(chromeInit);
var safariCore = coreSources.concat(safariInit);

var chromePanel = panelSources.concat(['./extensions/panel/js/init_chrome.js']);
var safariPanel = panelSources.concat(['./extensions/panel/js/init_safari.js']);

var chromePage = pageSources.concat(['./extensions/page/js/init_chrome.js']);
var safariPage = pageSources.concat(['./extensions/page/js/init_safari.js']);

gulp.task('chromePage', function () {
  gulp.src(chromePage)
    .pipe(gulp.dest('./extensions/chrome/'));
});

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

gulp.task('chromePageSources', function () {
  gulp.src(chromeOptions)
    .pipe(include_file())
    .pipe(concat('options.js'))
    .pipe(gulp.dest('./extensions/chrome/options/'));
});

gulp.task('chromeCore', function () {
  gulp.src(chromeCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/chrome/'));
});

gulp.task('chromePanel', function () {
  gulp.src(chromePanel)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/chrome/injected/'));
});

gulp.task('safariPage', function () {
  gulp.src(safariPage)
    .pipe(gulp.dest('./extensions/safari.safariextension/'));
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

gulp.task('safariPageSources', function () {
  gulp.src(safariPage)
    .pipe(include_file())
    .pipe(concat('options.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/options/'));
});

gulp.task('safariCore', function () {
  gulp.src(safariCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/'));
});

gulp.task('safariPanel', function () {
  gulp.src(safariPanel)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/injected/'));
});

gulp.task('watch', function() {
  gulp.watch(
    [
      './extensions/templates/**/*.*',
      './extensions/core/**/*.js',
      './extensions/options/**/*.js'
    ],
    [
      'chromeCore',
      'chromeLib',
      'chromeCss',
      'chromeImages',
      'chromePanel',
      'chromePageSources',
      'chromePage',

      'safariCore',
      'safariLib',
      'safariCss',
      'safariImages',
      'safariPanel',
      'safariPageSources',
      'safariPage'
    ]
  );
});

gulp.task('default',
  [
    'chromeCore',
    'chromeLib',
    'chromeCss',
    'chromeImages',
    'chromePanel',
    'chromePageSources',
    'chromePage',

    'safariCore',
    'safariLib',
    'safariCss',
    'safariImages',
    'safariPanel',
    'safariPageSources',
    'safariPage',

    'watch'
  ]
);
