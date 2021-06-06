"use strict";

var Application = require("./app");
var app = window.App = new Application();

// --------------------------------------------------
// On lance le chargement de l'application
// --------------------------------------------------
(function() {

  app.start();

  Backbone.history.start({ pushState: true });

  _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
  _.templateSettings.escape = /\{\{\-(.+?)\}\}/g;
  _.templateSettings.evaluate = /\<\%(.+?)\%\>/gim;
})()


