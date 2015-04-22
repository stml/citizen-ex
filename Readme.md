# Citizen Ex

In Development.

## Install all required packages

If you haven’t yet, install [Node](https://nodejs.org/). A bunch of packages are used to make file management easier, so stuff doesn’t have to be copied and pasted between the extensions.

Once you have node, in the project’s root directory run the following to install the required packages:

```
$ npm install
```

This will use the list of requirements from `package.json` to install what’s missing.

## Run gulp while working on it

I have broken up JavaScript files into smaller, more manageable ones. To inject some HTML into the current page it has to be included in JS files, and you can’t simply load the required ones from the extension. Because keeping HTML templates as JS strings in existing JS files is unmanageable, those little templates are now kept separately and inserted into JS files using Gulp.

Gulp runs several tasks: looks for those HTML file insertions, then concatenates all of the required JS in the right order, and saves the resulting file in the right location. The final file is regenerated every time something changes in the `/extensions/templates` directory.

It’s easier to organise the files, but the downside is that you have to leave Gulp running on the console.

From the project’s root directory run the following:

```
$ gulp
```

This will watch for any changes.


