"use strict";

var q = require('q');
var _ = require('underscore');
var config = require('config');
var express = require('express');
var router = express.Router();

module.exports = function(app) {

  app.route('/*').get(function(req, res) {

    res.render('index');
  });

  return app;
}

