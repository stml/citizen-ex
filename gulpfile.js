var gulp = require('gulp');
var concat = require('gulp-concat');
var include_file = require('gulp-include-file');

gulp.task('chromeTemplates', function () {
  gulp.src([
    './extensions/templates/js/overwrite_warning.js',
    './extensions/templates/js/log_entry.js',
    './extensions/templates/js/sidebar.js',
    './extensions/templates/js/sidebar_pane.js',
    './extensions/templates/js/initialize.js',
  ])
    .pipe(include_file())
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('./extensions/chrome/injected/'));
});

gulp.task('watch', function() {
  gulp.watch('./extensions/templates/**/*.*', ['chromeTemplates']);
});

gulp.task('default', ['chromeTemplates', 'watch']);
