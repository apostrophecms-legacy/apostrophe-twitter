var extend = require('extend');
var twitter = require('simple-twitter');
var _ = require('underscore');
var qs = require('qs');

module.exports = function(options) {
  return new widget(options);
};

function widget(options) {
  var apos = options.apos;
  var app = options.app;
  var consumerKey = options.consumerKey;
  var consumerSecret = options.consumerSecret;
  var accessToken = options.accessToken;
  var accessTokenSecret = options.accessTokenSecret;

  // How long to cache the feed, in seconds. Twitter's API rate limit is
  // rather generous at 300 requests per 15 minutes. We shouldn't get anywhere
  // near that, we'd make 30 requests. However with clustering we would have
  // separate caches and this might start to look like the right setting.

  var cacheLifetime = options.cacheLifetime || 30;
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

  // Serve our feeds. Be sure to cache them so we don't hit the rate limit.
  // TODO: consider using the streaming API for faster updates without hitting
  // the rate limit.

  var tweetCache = {};

  app.get('/apos-twitter/feed/:username', function(req, res) {
    var username = req.params.username;
    if (!username.length) {
      res.statusCode = 404;
      return res.send('not found');
    }
    if (_.has(tweetCache, username)) {
      var cache = tweetCache[username];
      var now = (new Date()).getTime();
      if (now - cache.when > cacheLifetime * 1000) {
        delete tweetCache[username];
      } else {
        return res.send(cache.results);
      }
    }
    var reader = new twitter(consumerKey, consumerSecret, accessToken, accessTokenSecret);
    return reader.get('statuses/user_timeline', '?' + qs.stringify({ screen_name: username }), function(err, results) {
      if (err) {
        results = [];
      }
      tweetCache[username] = { when: (new Date()).getTime(), results: results };
      return res.send(results);
    });
  });

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
