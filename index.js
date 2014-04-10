var extend = require('extend');
var twitter = require('simple-twitter');
var _ = require('lodash');
var qs = require('qs');

module.exports = function(options, callback) {
  return new Construct(options, callback);
};

module.exports.Construct = Construct;

function Construct(options, callback) {
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
  self._apos = apos;
  self._app = app;
  self._apos.mixinModuleAssets(self, 'twitter', __dirname, options);

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
  var url;

  app.get('/apos-twitter/feed', function(req, res) {
    var username = req.query.username;
    var hashtag = req.query.hashtag;

    if (!username.length) {
      res.statusCode = 404;
      return res.send('not found');
    }

    if (!hashtag.length) {
      url = 'statuses/user_timeline.json?' + qs.stringify({ screen_name: username, count: req.query.count || 5 });
    } else {
      url = 'search/tweets.json?' + qs.stringify({ q: 'from:' + username + ' #' + hashtag, count: req.query.count || 5 });
    }

    if (_.has(tweetCache, url)) {
      var cache = tweetCache[url];
      var now = (new Date()).getTime();
      if (now - cache.when > cacheLifetime * 1000) {
        delete tweetCache[url];
      } else {
        return res.send(cache.results);
      }
    }
    var reader = new twitter(consumerKey, consumerSecret, accessToken, accessTokenSecret);

    return reader.get(url, function(err, results) {
      if (err) {
        results = '[]';
      }
      results = JSON.parse(results);
      if (results.statuses) {
        results = results.statuses;
      }
      tweetCache[url] = { when: (new Date()).getTime(), results: results };
      return res.send(results);
    });
  });

  apos.itemTypes.twitter = {
    widget: true,
    label: 'Twitter',
    css: 'twitter',
    icon: 'twitter',
    jsonOptions: [ 'limit', 'profile' ],
    sanitize: function(item) {
      var matches = item.account.match(/\w+/);
      item.account = matches[0];
    },
    render: function(data) {
      return self.render('twitter', data);
    }
  };

  return setImmediate(function() { return callback(null); });
}
