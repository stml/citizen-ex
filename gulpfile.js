var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var include_file = require('gulp-include-file');

var images = ['./extensions/assets/images/*.*'];
var flags = ['./extensions/assets/flags/*.*'];

var page = ['./extensions/page/html/cx_page.html'];

var pageSources = [
  './extensions/shared/js/overwrite_warning.js',
  './extensions/core/js/browser.js',
  './extensions/core/js/storage.js',
  './extensions/core/js/message.js',
  './extensions/shared/js/log_entry.js',
  './extensions/shared/js/cx_extension.js',
  './extensions/page/js/leaflet-heat.js',
  './extensions/page/js/cx_page.js',
  './extensions/page/js/cx_page_view.js',
  './extensions/page/js/init_shared.js'
];

var panelCssSources = [
 './extensions/assets/css/overwrite_warning.css',
 './extensions/assets/css/panel.css',
 './extensions/assets/css/leaflet.css'
];

var pageCssSources = [
 './extensions/assets/css/overwrite_warning.css',
 './extensions/assets/css/page.css',
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
  './extensions/shared/js/cx_extension.js',
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


// Chrome tasks

gulp.task('chromeCore', function () {
  gulp.src(chromeCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/chrome/'));
});

gulp.task('chromeLib', function () {
  gulp.src(['./extensions/core/lib/*'])
    .pipe(gulp.dest('./extensions/chrome/lib'));
});

gulp.task('chromePanelCss', function () {
  gulp.src(panelCssSources)
    .pipe(concat('panel.css'))
    .pipe(gulp.dest('./extensions/chrome/panel/'));
});

gulp.task('chromePageCss', function () {
  gulp.src(pageCssSources)
    .pipe(concat('page.css'))
    .pipe(gulp.dest('./extensions/chrome/page/'));
});

gulp.task('chromeImages', function () {
  gulp.src(images)
    .pipe(gulp.dest('./extensions/chrome/images/'));
});

gulp.task('chromeFlags', function () {
  gulp.src(flags)
    .pipe(gulp.dest('./extensions/chrome/flags/'));
});

gulp.task('chromePanel', function () {
  gulp.src(chromePanel)
    .pipe(include_file())
    .pipe(concat('panel.js'))
    .pipe(gulp.dest('./extensions/chrome/panel/'));
});

gulp.task('chromePageSources', function () {
  gulp.src(chromePage)
    .pipe(include_file())
    .pipe(concat('page.js'))
    .pipe(gulp.dest('./extensions/chrome/page/'));
});

gulp.task('chromePage', function () {
  gulp.src(page)
    .pipe(rename('page.html'))
    .pipe(gulp.dest('./extensions/chrome/page/'));
});


// Safari tasks

gulp.task('safariCore', function () {
  gulp.src(safariCore)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/'));
});

gulp.task('safariLib', function () {
  gulp.src(['./extensions/core/lib/*'])
    .pipe(gulp.dest('./extensions/safari.safariextension/lib'));
});

gulp.task('safariPanelCss', function () {
  gulp.src(panelCssSources)
    .pipe(concat('panel.css'))
    .pipe(gulp.dest('./extensions/safari.safariextension/panel/'));
});

gulp.task('safariPageCss', function () {
  gulp.src(pageCssSources)
    .pipe(concat('page.css'))
    .pipe(gulp.dest('./extensions/safari.safariextension/page/'));
});

gulp.task('safariImages', function () {
  gulp.src(images)
    .pipe(gulp.dest('./extensions/safari.safariextension/images/'));
});

gulp.task('safariFlags', function () {
  gulp.src(flags)
    .pipe(gulp.dest('./extensions/chrome/flags/'));
});

gulp.task('safariPanel', function () {
  gulp.src(safariPanel)
    .pipe(include_file())
    .pipe(concat('panel.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/panel/'));
});

gulp.task('safariPageSources', function () {
  gulp.src(safariPage)
    .pipe(include_file())
    .pipe(concat('page.js'))
    .pipe(gulp.dest('./extensions/safari.safariextension/page/'));
});

gulp.task('safariPage', function () {
  gulp.src(page)
    .pipe(rename('page.html'))
    .pipe(gulp.dest('./extensions/safari.safariextension/page/'));
});


// Set up watch

gulp.task('watch', function() {
  gulp.watch(
    [
      './extensions/page/**/*.*',
      './extensions/panel/**/*.*',
      './extensions/core/**/*.js',
      './extensions/shared/**/*.*'
    ],
    [
      'chromeCore',
      'chromeLib',
      'chromePanelCss',
      'chromePageCss',
      'chromeImages',
      'chromeFlags',
      'chromePanel',
      'chromePageSources',
      'chromePage',

      'safariCore',
      'safariLib',
      'safariPanelCss',
      'safariPageCss',
      'safariImages',
      'safariFlags',
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
    'chromePanelCss',
    'chromePageCss',
    'chromeImages',
    'chromeFlags',
    'chromePanel',
    'chromePageSources',
    'chromePage',

    'safariCore',
    'safariLib',
    'safariPanelCss',
    'safariPageCss',
    'safariImages',
    'safariFlags',
    'safariPanel',
    'safariPageSources',
    'safariPage',

    'watch'
  ]
);
