var lusca = require('lusca');
var q = require('q');
var morgan = require('morgan');
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var expressStaticGzip = require('express-static-gzip');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');

// On expose le serveur express
var app = module.exports = express();

app.use("/", expressStaticGzip(__dirname +'/app/build', {
  index: false
}));

app.set('view engine', 'pug');
app.set('views', __dirname + '/app/views/');

app.use(methodOverride());

app.use(bodyParser.json({ limit:'5mb' }));
app.use(bodyParser.urlencoded({limit: "5mb", extended: true, parameterLimit:5000}));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));


app.use(morgan(':method :url'));

require('./api/routes')(app);
