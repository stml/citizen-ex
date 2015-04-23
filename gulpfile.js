var gulp = require('gulp');
var concat = require('gulp-concat');
var include_file = require('gulp-include-file');

var coreSources = [
  './extensions/templates/js/overwrite_warning.js',
  './extensions/core/js/background.js'
];

var templateSources = [
  './extensions/templates/js/overwrite_warning.js',
  './extensions/templates/js/log_entry.js',
  './extensions/templates/js/sidebar.js',
  './extensions/templates/js/sidebar_pane.js',
  './extensions/templates/js/initialize.js'
];

gulp.task('chromeCore', function () {
  gulp.src(coreSources)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/chrome/'));
});

gulp.task('chromeTemplates', function () {
  gulp.src(templateSources)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/chrome/injected/'));
});

gulp.task('safariCore', function () {
  gulp.src(coreSources)
    .pipe(include_file())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./extensions/safari/'));
});

gulp.task('safariTemplates', function () {
  gulp.src(templateSources)
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/safari/injected/'));
});

gulp.task('watch', function() {
  gulp.watch('./extensions/templates/**/*.*', ['chromeCore', 'chromeTemplates', 'safariCore', 'safariTemplates']);
});

gulp.task('default', ['chromeCore', 'chromeTemplates', 'safariCore', 'safariTemplates', 'watch']);
