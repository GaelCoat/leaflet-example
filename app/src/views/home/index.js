var tpl = require("pug-loader!./tpl.pug");
var L = require('leaflet');
var LP = require('leaflet-providers');
var LGPX = require('leaflet-gpx');
var IGN = require('geoportal-extensions-leaflet');
import Chart from 'chart.js/auto';

// Display icons with toggle
//

module.exports = Marionette.View.extend({

  className: '',

  events: {
  },

  map: null,

  initialize: function() {
  },

  initMap: function() {

    var that = this;

    var map = this.map = L.map('map', {
      center: [43.874, 5.401],
      zoom: 12
    });

    L.tileLayer.provider('CartoDB.Positron').addTo(map);

    L.Control.Location = L.Control.extend({
      onAdd: function(map) {

        var container = L.DomUtil.create('div', 'leaflet-bar');
        var a = L.DomUtil.create('a', '', container);
        var img = L.DomUtil.create('img', '', a);
        img.src = '/img/location_search.svg';

        container.addEventListener('click', function(e) {

          that.map.setView(that.location.getLatLng());
        })

        return container;
      },

      onRemove: function(map) {
      }
    });

    L.control.location = function(opts) {
      return new L.Control.Location(opts);
    }

    L.control.location({ position: 'topleft' }).addTo(map);
    
    //this.renderPOI();
    //this.renderGPX();
    this.initGPS();
  },

  // cancel automove && autozoom on drag
  // add location button
  initGPS: function() {

    var that = this;

    this.map.locate({watch: true});

    this.map.on('locationfound', function(e) {

      that.map.setView(e.latlng);

      if (that.location) {

        return that.location.setLatLng(e.latlng);
      }

      var myIcon = L.icon({
        iconUrl: `/img/location.svg`,
        iconSize: [90, 138],
      });

      that.location = L.marker(e.latlng, {
        icon: myIcon
      })
      .addTo(that.map)
    });

    this.map.on('locationerror', function(err) {
      console.log(err);
    });
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
    }).on('loaded', function(e) {

      that.map.fitBounds(e.target.getBounds());
      console.log(gpx.get_distance()/1000);

      that.renderElevationGraph(gpx.get_elevation_data());

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
