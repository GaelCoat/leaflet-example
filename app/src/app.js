var Router = require('./router');
var Layout = require('./layout');
var style = require('./sass/main.scss');

module.exports = Marionette.Application.extend({

  region: 'body',

  router: null,
  layout: null,

  type: 'office',
  tokens: {},


  onStart: function(params) {
    this.router = new Router();
    this.router.on('router:render', this.loadView.bind(this));

    this.layout = new Layout();
    this.layout.on('redirect', this.cleanRedirect.bind(this));

    this.listenTo(Backbone, 'redirect', this.cleanRedirect.bind(this));
  },

  cleanRedirect: function(url) {

    this.router.navigate(url, true);
    return this;
  },

  loadView: function(route) {

    return this.layout.loadView(route.view, route.params);
  },


});
