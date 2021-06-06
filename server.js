"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config/';

var fs = require('fs');
var config = require('config');
var cluster = require('cluster');

var dirs = [
  __dirname + '/app/build',
];

dirs.forEach(function(dir) {

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

if (cluster.isMaster) {

  var numCPUs = process.env.NODE_CPU || 1 || require('os').cpus().length;

  console.log('Starting in '+process.env.NODE_ENV+' mode');

  // On lance tous les workers possibles
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('listening', function(worker, address) {

    console.log("Worker "+worker.id+" is now connected to " + address.address + ":" + address.port);
  });

  cluster.on('exit', function(worker, code, signal) {

    // Log de la mort du worker
    console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code);

    // On en relance un
    // cluster.fork();
  });

} else {

  // Pour chaque worker, on lance un serveur HTTP
  var app = require('./app');
  app.listen(process.env.PORT || config.get('port'));
}
