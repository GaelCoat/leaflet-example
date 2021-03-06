var tpl = require("pug-loader!./tpl.pug");
var L = require('leaflet');
var LP = require('leaflet-providers');
var LGPX = require('leaflet-gpx');
var LR = require('leaflet-marker-rotation');
var Routing = require('leaflet-routing-machine');
var Utils = require('leaflet-geometryutil');
import nearestPoint from '@turf/nearest-point';
import Chart from 'chart.js/auto';
var leafletKnn = require('leaflet-knn');

// Display icons with toggle
//

module.exports = Marionette.View.extend({

  className: '',

  events: {
    'click #start-hiking': 'initGPS'
  },

  map: null,
  autoMove: true,

  GPS_init: false,
  first: true,
  calcRange: 50,

  initialize: function() {
  },

  initMap: function() {

    var that = this;

    var map = this.map = L.map('map', {
      center: [43.874, 5.401],
      zoom: 12
    });

    L.tileLayer.provider('CartoDB.Positron').addTo(map);
    
    
    //this.renderPOI();
    this.renderGPX();
    //this.initGPS();
  },

  // cancel automove && autozoom on drag
  // add location button
  initGPS: function() {

    var that = this;

    this.$el.find('#start-hiking').hide();

    if (this.GPS_init) return;
    this.GPS_init = true;


    if (window.DeviceOrientationEvent) {

      window.addEventListener("deviceorientation", function(event) {
          // alpha: rotation around z-axis
          var rotateDegrees = event.alpha;
          that.location_orientation.setRotationAngle(-rotateDegrees)
      }, true);
    }

    this.createLocationControl();

    this.map.dragging.enable();

    this.map.on('drag', function(e) {

      that.autoMove = false;
    })

    this.map.locate({watch: true});

    this.map.on('locationfound', function(e) {

      that.traceRoute(e.latlng);

      if (that.autoMove) that.map.setView(e.latlng);

      if (that.location) {

        that.location_orientation.setLatLng(e.latlng);
        that.location.setLatLng(e.latlng);
        return;
      }

      var OrientationIcon = L.icon({
        iconUrl: `/img/location_orientation.svg`,
        iconSize: [90,90],
        iconAnchor: [45,67]
      });

      that.location_orientation = L.rotatedMarker(e.latlng, {
        icon: OrientationIcon,
        rotationAngle: 0,
        rotationOrigin: 'center'
      })
      .addTo(that.map)

      var LocationIcon = L.icon({
        iconUrl: `/img/location.svg`,
        iconSize: [90, 138],
      });

      that.location = L.marker(e.latlng, {
        icon: LocationIcon,
        draggable: false
      })
      .addTo(that.map)

      // tests
      /*that.location.on('dragend', function(a) {
        that.traceRoute(a.target._latlng);
      })*/
    });

    this.map.on('locationerror', function(err) {
      console.log(err);
    });
  },

  isNearGPX: function(latlng) {

    var gj = L.geoJson(this.gpx_path.toGeoJSON());
    var nearest = leafletKnn(gj).nearest(latlng, 1, 25); // 25 meters
    if (nearest.length > 0) return true;
    return false;
  },

  updateRoute: function(latlng) {

    // Route is not yet found, we wait
    if (!this.route._line) return;

    // We are near the GPX, we don't calculate any route
    if (this.isNearGPX(latlng)) {
      this.route.remove();
      this.route = false;
      return;
    }

    // Finding the correct path
    var path = _.find(this.route._line._layers, function(l) {

      return l.options.color === '#66A3FF';
    }); 

    if (this.first) {
      path._latlngs.unshift(latlng);
      this.first = false;
    } else {

      path._latlngs[0] = latlng;
    }

    path.redraw();

    var gj = L.geoJson(path.toGeoJSON());
    var nearest = leafletKnn(gj).nearest(latlng, 3, 50);

    nearest.forEach(function(p) {

      p.index = _.findIndex(path._latlngs, function(c) {

        return c.lat == p.lat && c.lng == p.lon;
      });

    });

    // We are too far from the route, we recalculate
    if (nearest.length <= 1) {

      this.route.spliceWaypoints(0, 1, latlng);
      return this.route.route();
    }

    if (nearest[1].index > 1) {

      path._latlngs.splice(1, nearest[1].index - 1);
      path.redraw();
    } else {

      // check distance, if close, replace [1]
      var distance = this.calculateDistance(latlng, nearest[1]) * 1000; // meters
      if (distance <= 5) {
        path._latlngs.splice(1, 1);
        path.redraw();
      }
    }
  },

  calculateDistance: function(a, b) {

    var lat1 = a.lat;
    var lng1 = a.lng;
    var lat2 = b.lat || b.lat;
    var lng2 = b.lng || b.lon;

    var R = 6371; // km
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLng = (lng2-lng1) * Math.PI / 180;
    var lat1 = lat1 * Math.PI / 180;
    var lat2 = lat2 * Math.PI / 180;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  },

  traceRoute: function(latlng) {

    var that = this;

    // We are near the GPX, we don't calculate any route
    if (this.isNearGPX(latlng)) return;

    // Route is already calculated, we update the line
    if (this.route) return this.updateRoute(latlng);

    this.route = L.Routing.control({
      waypoints: [
        latlng,
        this.starting_point
      ],
      router: L.Routing.mapbox('pk.eyJ1IjoicnJycnJyb3VnZSIsImEiOiJja3FjbXp4eXIwaGlqMndsZHNzeG11bGNwIn0.JaU8dNsfFbJLRcu7nUBOmQ'),
      draggableWaypoints: false,
      addWaypoints: false,
      createMarker: function() { return false },
      lineOptions: {
        styles: [{color: '#66A3FF', opacity: 0.75, weight: 3}],
        missingRouteStyles: [{color: '#000000', opacity: 0, weight: 3}]
      }
    }).addTo(this.map);

    this.route.on('routesfound', function(e) {
      console.log('Route found', e);
    })
    this.route.on('routingerror', function(err) {
      console.log('Routing error', err);
    })
  },


  // Renders Points of interest on the map
  renderPOI: function() {

    var that = this;
    var icons = ['museum', 'biking'];
    var points = 25;

    for(var i = 0; i < points; i++) {

      var lat = Number(43+'.'+_.random(700, 950));
      var lng = Number(5+'.'+_.random(0, 700));

      var index = _.random(0, icons.length-1);

      var myIcon = L.icon({
        iconUrl: `/img/${icons[index]}.png`,
        iconSize: [103, 62],
        iconAnchor: [32,32],
        className: 'animated-icon',
      });

      var marker = L.marker([lat, lng], {
        icon: myIcon,
        title: 'test',
      });

      marker.bindPopup('<p>Hello world!<br />This is a nice popup.</p>').openPopup();

      marker.addTo(that.map);
    }

    // max animation duration is 2000ms
    var duration = (2000 / points) > 100 ? 100 : 2000 / points;

    this.$el.find('.animated-icon').each(function(index) {

      var $this = $(this);
      _.delay(function() {

        $this.addClass('displayed');
      }, duration*index);
    })
  },

  // Renders a GPX file on the map
  renderGPX: function() {

    var that = this;

    var gpx = new L.GPX('/example.gpx', {
      async: true,
      marker_options: {
        startIconUrl: 'img/pin-icon-start.png',
        endIconUrl: 'img/pin-icon-end.png',
        shadowUrl: ''
      },
      polyline_options: {
        color: '#ffbdd0',
        opacity: 1,
        weight: 3,
        lineCap: 'round'
      }
    })
    .on('addpoint', function(e) {
      if (e.point_type === 'start') that.starting_point = L.latLng(e.point._latlng.lat, e.point._latlng.lng);
    })
    .on('loaded', function(e) {

      that.gpx_path = _.find(e.layers._layers, function(l) {

        return l.options.color === "#ffbdd0";
      }); 

      that.map.fitBounds(e.target.getBounds());

      //that.renderElevationGraph(gpx.get_elevation_data());

    }).addTo(that.map);
  },

  // Renders GPX file elevation data
  renderElevationGraph: function(data) {

    var dots = [];
    var labels = [];

    var max = 200;
    var skip = (data.length / max) <= 1 ? 1 : data.length / max;
    var currentIndex = 0;

    data.forEach(function(dot, index) {

      if (index - currentIndex >= skip) {
        currentIndex = index;
        labels.push(dot[0].toFixed(2)+' Km');
        dots.push(dot[1]);
      }
    });

    var myChart = new Chart(this.$el.find('#elevation'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            radius: 0,
            data: dots,
            fill: true,
            backgroundColor: '#efefef'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        hover: {
          mode: 'index',
          intersect: false,
          animationDuration: 0
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false
          },
        },
        scales: {
          yAxis: {
            ticks: {
              autoSkip: true,
              beginAtZero: true,
              fontColor: '#979797',
              fontSize: '15px',
              padding: 12,
              fontFamily: 'Montserrat',
            },
            gridLines: { 
              color: "#EFF3F9",
              zeroLineColor: "#EFF3F9"
            }
          },
          x: {
            display: false
          }
        } 
      }
    });
  },

  createLocationControl: function() {

    var that = this;

    // Location button
    L.Control.Location = L.Control.extend({
      onAdd: function(map) {

        var container = L.DomUtil.create('div', 'leaflet-bar');
        var a = L.DomUtil.create('a', '', container);
        var img = L.DomUtil.create('img', '', a);
        img.src = '/img/location_search.svg';

        container.addEventListener('click', function(e) {

          that.map.setView(that.location.getLatLng());
          that.autoMove = true;
        });

        return container;
      },

      onRemove: function(map) {
      }
    });

    L.control.location = function(opts) { return new L.Control.Location(opts); }
    L.control.location({ position: 'topleft' }).addTo(this.map);
  },
  
  render: function() {

    var that = this;

    return q.fcall(function() {

      // Security
      var html = tpl();
      var template = _.template(html);

      that.$el.html(template({
      }));

      return that.initMap();
    })
    .catch(function(err) {
      console.log(err);
    })

  }

});
