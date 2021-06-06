var tpl = require("pug-loader!./tpl.pug");
var L = require('leaflet');
var LP = require('leaflet-providers');
var LGPX = require('leaflet-gpx');

module.exports = Marionette.View.extend({

  className: '',
  id: 'map',

  events: {
  },

  initialize: function() {
  },

  initMap: function() {

    var that = this;

    var map = L.map('map', {
      center: [43.874, 5.401],
      zoom: 12
    });

    L.tileLayer.provider('CartoDB.Positron').addTo(map);
    
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

      marker.addTo(map);
    }

    // max animation duration is 2000ms
    var duration = (2000 / points) > 100 ? 100 : 2000 / points;

    this.$el.find('.animated-icon').each(function(index) {

      var $this = $(this);
      _.delay(function() {

        $this.addClass('displayed');
      }, duration*index);
    })

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
      map.fitBounds(e.target.getBounds());
      console.log(gpx.get_distance()/1000);
    }).addTo(map);

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
