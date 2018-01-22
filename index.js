var extend = require('extend');
var Twitter = require('simple-twitter');
var _ = require('lodash');
var qs = require('qs');

module.exports = function (options, callback) {
  return new Construct(options, callback);
};

module.exports.Construct = Construct;

function Construct (options, callback) {
  var apos = options.apos;
  var app = options.app;
  if (!options.consumerKey) {
    console.error('WARNING: you must configure the consumerKey, consumerSecret, accessToken and accessTokenSecret options to use the Twitter widget.');
  }
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

  app.get('/apos-twitter/feed', function (req, res) {
    var username;
    var hashtag;
    if (req.query.username) {
      username = apos.sanitizeString(req.query.username);
    }
    if (req.query.hashtag) {
      hashtag = apos.sanitizeString(req.query.hashtag);
    }

    if (username && !username.length) {
      res.statusCode = 404;
      return res.send('not found');
    }

    if (username && !hashtag) {
      url = 'statuses/user_timeline.json?' + qs.stringify({ screen_name: username, tweet_mode: 'extended', count: req.query.count || 5 });
    } else if (username && hashtag) {
      url = 'search/tweets.json?' + qs.stringify({ q: 'from:' + username + ' #' + hashtag, tweet_mode: 'extended', count: req.query.count || 5 });
    } else if (hashtag && !username) {
      url = 'search/tweets.json?' + qs.stringify({ q: ' #' + hashtag, tweet_mode: 'extended', count: req.query.count || 5 });
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
    var reader = new Twitter(consumerKey, consumerSecret, accessToken, accessTokenSecret);

    return reader.get(url, function (err, results) {
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

  self.widget = true;
  self.label = 'Twitter';
  self.css = 'twitter';
  self.icon = 'icon-twitter';
  self.sanitize = function (item) {
    if (item.account) {
      var matches = item.account.match(/\w+/);
      item.account = matches[0];
    }
  };
  self.renderWidget = function (data) {
    return self.render('twitter', data);
  };
  self._apos.addWidgetType('twitter', self);

  return setImmediate(function () { return callback(null); });
}
