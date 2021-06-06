var _ = require('underscore');

function WebpackPugManifestPlugin () {
}

var order = [
  "^(/css/app\\.)",
  "^(vendor\\.)",
  "^(vendors~app~vendor\\.)",
  "^(vendors~app\\.)",
  "^(app\\.)"
]

WebpackPugManifestPlugin.prototype.apply = function (compiler) {
  
  compiler.plugin('emit', function (compilation, callback) {
    var assets = [];
    for (var asset in compilation.assets) {
      assets.push(asset);
    }

    assets = assets.filter(function(asset) {

      const isPNG = RegExp('.png').test(asset);
      const isCSS = RegExp('.css').test(asset);

      return !isPNG && !(isCSS && !RegExp('^(/css/app\.)').test(asset));
    });

    assets = _.sortBy(assets, function(asset) {

      return _.findIndex(order, function(str) {

        return RegExp(str).test(asset);
      })
    });

    compilation.assets['js-manifest.pug'] = {
      source: function () {
        return assets.reduce(function (accumulation, asset) {

          const isJS = RegExp('.js').test(asset);

          if (isJS) {

            return accumulation + 'script(type="text/javascript" src="' + asset.replace('.gz', '') + '")\n';
          } else {

            return accumulation;
          }

        }, '');
      },
      size: function () {
        return assets.length;
      }
    };

    compilation.assets['css-manifest.pug'] = {
      source: function () {
        return assets.reduce(function (accumulation, asset) {

          const isCSS = RegExp('.css').test(asset);

          if (isCSS) {

            return accumulation + 'link(rel="stylesheet" type="text/css" href="' + asset.replace('.gz', '') + '")\n';

          } else {

            return accumulation;
          }

        }, '');
      },
      size: function () {
        return assets.length;
      }
    };
    callback();
  });
};

module.exports = WebpackPugManifestPlugin;