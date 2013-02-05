module.exports = function(options) {
  new widget(options);
};

function widget(options) {
  var jot = options.jot;
  var app = options.app;
  var self = this;
  
  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  jot.defaultControls.push('twitter');

  // Include our editor template in the markup when jotTemplates is called
  jot.templates.push(__dirname + '/views/twitterEditor');

  // Make sure that jotScripts and jotStylesheets summon our assets
  jot.scripts.push('/jot-twitter/js/twitter.js');
  jot.stylesheets.push('/jot-twitter/css/twitter.css');

  // Serve our assets
  app.get('/jot-twitter/*', jot.static(__dirname + '/public'));

  jot.itemTypes.twitter = {
    widget: true,
    label: 'Twitter',
    css: 'twitter',
    sanitize: function(item) {
      var matches = item.account.match(/\w+/);
      item.account = matches[0];
    },
    render: function(data) {
      return jot.partial('twitter.html', data, __dirname + '/views');
    }
  };
}
