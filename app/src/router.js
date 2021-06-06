
module.exports = Backbone.Router.extend({

  routes: {
    '': 'handling',
  },

  handling: function() { 
    return this.loadView('home/index', {tab: 'home'});
  },
  
  loadView: function(view, params) {

    this.trigger('router:render', {view: view, params: params});
    return this;
  }
});
