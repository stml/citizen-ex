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

All the tasks come from `/.gulpfile.js`, which is relatively readable.

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

### sidebar_pane.js

Includes all code relating to the Backbone view. The model and the view communicate whenever changes or events occur so that any updates can be reflected immediately.

## Working with Backbone

Backbone in this project is used to provide a way of organising code and managing state. Things may update at different times, and we want to display the latest information. Backbone helps with that. It has a lot of features that are *not* used here.

### Model

Backbone model is designed to store logic and data. In the extension we have a Sidebar model (no longer a good name, to be changed).

The sidebar model is defined, and then we create one instance of it:

```
var sidebar = new Sidebar();
```

#### Storing and retrieving data

If you want to store something on the model, you can do it like so:

```
sidebar.set({ catName: 'Felix', height: 50  }); // setting multiple things at once is possible
// or
sidebar.set('catName', 'Felix'); // one value only
```
To retrieve a piece of information:

```
sidebar.get('catName'); // returns 'Felix'
```

#### Useful functions

There are a few useful functions that are run at different times.

Some of the ones likely to be accessed from the view:

- `sidebar.getCitizenshipForDays(n)`: Returns an object with citizenship info for any number of days — designed for displaying as the badge.
- `sidebar.getTabEntriesForDays(n)`: Returns an object with data for tabs open for the past _n_ days — designed to be placed on the map.

Other interesting ones, mostly used to set things up:

- `sidebar.setUpCitizenship()`: Fetches from storage the info about all countries visited and remebers it.
- `sidebar.setUpOpenTabsCitizenship()`: Fetches the info about countries visited for currently open tabs and remebers it.

### View

Backbone views are meant to use the model for any calculations, storing data etc, and only have information about what to render, what events to handle, and which model changes to respond to.

I named the view SidebarPane but it will change.

The view is defined and then I create one instance of it for every “pane” (this was made when I thought there would be multiple pages with different content).

#### Events

We want to be able to do stuff on click etc. Events are handled inside the view declaration using the `events` object:

```
events: {
  'click .erase': 'eraseData',
  'click a': 'togglePane'
}
```

When the `.erase` link is clicked, the view runs this function:

```
eraseData: function(event) {
  event.preventDefault();
  this.model.eraseData();
}
```

`this.model.eraseData()` tells the model to run its own function called `eraseData`, which *actually* erases stuff. The view just
sends the model a message about it. When you need the view to make changes to data, or get any calculations done, etc. this is the strategy you should use.

#### Listening to data changing on the model

Model can constantly update its own data, for exaple when we initialise it we attempt to fetch the citizenship data. This can take a while, but once it is found, it is stored. The view can subscribe to changes on the model, so that it knows when to update: every time we save data, remove it or change it the view can get notified.

This subscription is set up when the view is first created, inside the `initialize` function:

```
this.listenTo(this.model, 'change', this.render);
```

We tell this view to listen to *any* changes on the model, and when they occur it will run the `render()` function. `render` is the customary name.

In our case the setup is slightly different. We have a few different listeners set up, because some need extra stuff. Consider the following code:

```
this.listenTo(this.model, 'change:entry', function(model, logEntry) {
  this.model.setUpCitizenship();
  this.render(model, this.model.get('activePane'));
})
```

We listen to changes on `entry` property (representing info about the current tab). `sidebar.set('entry', { ... })` is set only once, so that function only runs when that data becomes available. It then fetches and calculates the citizenship, and only then runs the `render` function.

##### `render()`

The following happens any time change occurs. It’s general — we throw away the entire view and render it out again with fresh data.

```
render: function(model, pane) {
  // check if this view instance is for the current pane
  if (pane) {
    switch (pane.name) {
      case this.name:
        // if so, we take all data from the model
        // and use the template to render it out
        this.$el.html(this.template(this.model.toJSON()));
        // and animate
        this.$el.slideDown();
        break;
      default:
        this.$el.slideUp();
        break;
    }
  } else {
    this.$el.slideUp();
  }
}
```

## Chrome

### The background script

I will shortly update the information about the structure of the background script.
