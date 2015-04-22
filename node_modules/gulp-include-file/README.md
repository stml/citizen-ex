# gulp-include-file
Include the contents of a file inside a javascript file. This module will read
the contents of the file specified and then create a javascript string which
will be injected at the place specified.

## Install

    npm install gulp-include-file

## Example
Given the following javascript file:

```javascript
function getText() {
  return INCLUDE_FILE("example.txt");
}
```

And the following `example.txt` in the same directory:

    Hello world!

    This is a string.

This module will generate the following file:

```javascript
function getText() {
  return "Hello world\n\nThis is a string.";
}
```

Using this example gulpfile:

```javascript
var gulp = require('gulp');
var include_file = require('gulp-include-file');

gulp.task('example', function () {
  gulp.src('./src/scripts/**/*.js')
    .pipe(include_file())
    .pipe(gulp.dest('./dist'));
});
```

## Options

* **regex**: The regex to use instead of the default one.
* **transform**: The transform function to use instead of the default one.

## License
This module is released under the MIT license.
