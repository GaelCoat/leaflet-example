var req = require.context("./", true, /\.js$/);

module.exports = Marionette.View.extend({

  el: 'body',

  events: {
    'click a[soft]': 'handleRedirect',
    'click a[hard]': 'handleHardRedirect',
    'click aside a[soft]': 'handleActiv',
    'click .open-dropdown': 'openDropdown',
    'click': 'closeDropdown',
    'click .select a': 'select',
    'mouseenter .has-tooltip': 'showTooltip',
    'click .has-tooltip': 'hideTooltip',
    'mouseleave .has-tooltip': 'hideTooltip',
  },

  regions: {
    //footer: "#footer",
    content: "content"
  },

  initialize: function() {

    this.$el.find('content').scroll(this.scroll);
    this.customEvent = new Event('changed');

    this.listenTo(Backbone, 'hide:tooltip', this.hideTooltip.bind(this));
    this.listenTo(Backbone, 'display:loader', this.showLoader.bind(this));
    this.listenTo(Backbone, 'delay:hide:tooltip', function() {

      _.delay(that.hideTooltip.bind(that), 1000);
    });
  },

  showLoader: function(show) {

    if (show) $('#loader').show();
    else $('#loader').fadeOut('fast');
  },

  showTooltip: function(e) {

    var target = $(e.currentTarget);

    var text = target.attr('data-infos');

    this.currentTooltip = $('<div>').addClass('tooltip').text(text);

    if (target.hasClass('no-break')) this.currentTooltip.addClass('no-break');

    $('body').append(this.currentTooltip);

    this.currentTooltip.css({
      top: target.offset().top - 6,
      left: target.offset().left + (target.width()/2) - (this.currentTooltip.width()/2),
    });
  },

  hideTooltip: function() {

    if (!this.currentTooltip) return false;

    this.currentTooltip.remove();
    delete this.currentTooltip;
  },

  select: function(e) {

    var row = this.$el.find(e.currentTarget).find('span');
    var selector = this.$el.find(e.currentTarget).closest('.select');

    selector.find('.choice').text(row.text());
    selector.find('.choice').attr('data-value', row.data('value'));

    selector[0].dispatchEvent(this.customEvent);
  },

  scroll: _.throttle(function(e) {

    var el = $(e.currentTarget);
    var max = e.currentTarget.scrollHeight - 200;

    if (el.scrollTop() + el.outerHeight() >= max) Backbone.trigger('page:fetch');
    Backbone.trigger('page:scrolling');
  }, 200),

  openDropdown: function(e) {

    e.preventDefault();
    e.stopPropagation();

    var target = this.$el.find(e.currentTarget);

    if (target.hasClass('open')) target.removeClass('open');
    else this.closeDropdown(), target.addClass('open');

    return this;
  },

  closeDropdown: function(e) {

    this.$el.find('.open-dropdown.open').removeClass('open');
    return this;
  },

  //-------------------------------------
  // Soft Redirect
  //-------------------------------------
  handleRedirect: function(e) {

    var href = $(e.currentTarget).attr('href');
    var protocol = this.protocol + '//';

    if (href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      this.trigger('redirect', href)
    }

    return this;
  },

   handleHardRedirect: function(e) {

    var href = $(e.currentTarget).attr('href');

    return window.location = href;
  },

  handleActiv: function(e, tab) {

    var tab =  tab || this.$el.find(e.currentTarget).parent().attr('tab');

    this.$el.find('aside li').removeClass('activ');
    this.$el.find("aside li[tab='"+tab+"']").addClass('activ');

    return this;
  },

  loadView: function(path, params) {

    var ItemView = req('./views/'+path+'.js');

    var view = new ItemView(params);
    this.getRegion('content').empty();
    this.getRegion('content').show(view);

    return this;
  }


});
