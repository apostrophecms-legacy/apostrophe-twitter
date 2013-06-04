var extend = require('extend');

module.exports = function(options) {
  return new widget(options);
};

function widget(options) {
  var apos = options.apos;
  var app = options.app;
  var self = this;
  self._dirs = (options.dirs || []).concat([ __dirname ]);

  self.pushAsset = function(type, name, optionsArg) {
    var options = {};
    extend(true, options, optionsArg);
    options.fs = __dirname;
    options.web = '/apos-twitter';
    return apos.pushAsset(type, name, options);
  };

  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  apos.defaultControls.push('twitter');

  // Include our editor template in the markup when aposTemplates is called
  self.pushAsset('template', 'twitterEditor', { when: 'user' });

  // Make sure that aposScripts and aposStylesheets summon our assets
  self.pushAsset('script', 'content', { when: 'always' });
  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'content', { when: 'always' });

  // Serve our assets
  app.get('/apos-twitter/*', apos.static(__dirname + '/public'));

  apos.itemTypes.twitter = {
    widget: true,
    label: 'Twitter',
    css: 'twitter',
    icon: 'twitter-bird',
    sanitize: function(item) {
      var matches = item.account.match(/\w+/);
      item.account = matches[0];
    },
    render: function(data) {
      // return apos.partial('twitter', data, __dirname + '/views');
      return apos.partial('twitter', data, self._dirs.map(function(dir) { return dir + '/views'; }) );
    }
  };
}
