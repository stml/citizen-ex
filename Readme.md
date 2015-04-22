# Citizen Ex

In Development.

## Install all required packages

If you haven’t yet, install [Node](https://nodejs.org/). A bunch of packages are used to make file management easier, so stuff doesn’t have to be copied and pasted between the extensions.

Once you have Node, in the project’s root directory run the following to install packages:

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

This will watch for any changes. Currently it only overwrites the `extensions/chrome/injected/setup.js` file, as it includes HTML snippets.

## Project structure

The `extensions` directory is where all the extension-related code lives. Each extension has its own subdirectory, but they share some code from the `templates` dir.

Templates directory has some shared JavaScript files and HTML templates to be inserted into the page.

The main areas of interest are:
- `extensions/templates/html`: HTML snippets injected into the page
- `extensions/templates/js/sidebar.js`: Backbone model which stores data and provides useful functions
- `extensions/templates/js/sidebar_pane.js`: Backbone view which listens to model changes and knows how to render itself

### log_entry.js

This file defines the LogEntry class for use in the extension.

### sidebar.js

In this file you can find the Backbone model storing data used in the extension, and utility functions that you can use from the view. I will be renaming it to something more appropriate.

### siedebar_pane.js

Includes all code relating to the Backbone view. The model and the view communicate whenever changes or events occur so that any updates can be reflected immediately.

## Chrome

### The background script

I will shortly update the information about the structure of the background script.
