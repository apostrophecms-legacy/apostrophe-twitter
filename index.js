module.exports = function(options) {
  new widget(options);
};

function widget(options) {
  var apos = options.apos;
  var app = options.app;
  var self = this;
  
  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  apos.defaultControls.push('twitter');

  // Include our editor template in the markup when aposTemplates is called
  apos.templates.push(__dirname + '/views/twitterEditor');

  // Make sure that aposScripts and aposStylesheets summon our assets
  apos.scripts.push('/apos-twitter/js/twitter.js');
  apos.stylesheets.push('/apos-twitter/css/twitter.css');

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
      return apos.partial('twitter.html', data, __dirname + '/views');
    }
  };
}
