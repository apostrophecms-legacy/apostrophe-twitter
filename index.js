module.exports = function(options) {
  return new widget(options);
};

function widget(options) {
  var apos = options.apos;
  var app = options.app;
  var self = this;

  self.pushAsset = function(type, name) {
    return apos.pushAsset(type, name, __dirname, '/apos-twitter');
  };

  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  apos.defaultControls.push('twitter');

  // Include our editor template in the markup when aposTemplates is called
  self.pushAsset('template', 'twitterEditor');

  // Make sure that aposScripts and aposStylesheets summon our assets
  self.pushAsset('script', 'twitter');
  self.pushAsset('stylesheet', 'twitter');

  // Serve our assets
  app.get('/apos-twitter/*', apos.static(__dirname + '/public'));

  apos.itemTypes.twitter = {
    widget: true,
    label: 'Twitter',
    css: 'twitter',
    sanitize: function(item) {
      var matches = item.account.match(/\w+/);
      item.account = matches[0];
    },
    render: function(data) {
      return apos.partial('twitter', data, __dirname + '/views');
    }
  };
}
