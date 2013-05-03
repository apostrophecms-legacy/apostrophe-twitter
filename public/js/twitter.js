apos.widgetTypes.twitter = {
  label: 'Twitter',
  editor: function(options) {
    var self = this;
        
    if (!options.messages) {
      options.messages = {};
    }
    if (!options.messages.missing) {
      options.messages.missing = 'Type in a Twitter account name first.';
    }

    self.afterCreatingEl = function() {
      self.$account = self.$el.find('.apos-twitter-account');
      self.$account.val(self.data.account);
      setTimeout(function() {
        self.$account.focus();
        self.$account.setSelection(0, 0);
      }, 500);
    };

    self.prePreview = getAccount;
    self.preSave = getAccount;

    function getAccount(callback) {
      self.exists = !!self.$account.val();
      if (self.exists) {
        self.data.account = self.$account.val();
      }
      return callback();
    }

    self.type = 'twitter';
    options.template = '.apos-twitter-editor';

    // Parent class constructor shared by all widget editors
    apos.widgetEditor.call(self, options);
  },
};

// TODO: a separate JS file for this since it's needed at all times
// and the editor is not (see editor.js vs. content.js). Letting people
// edit tends to sneak into sites so much that we might not bother
// with the distinction much in practice

apos.widgetPlayers.twitter = function($widget) {
  var account = $widget.attr('data-account');
  $.getJSON(
    // Note the trailing ? is significant. It tells jQuery to automatically
    // create a JSONP callback function and obtain the result via a cross-domain
    // script tag so we can talk to twitter in older browsers without a
    // security error
    'https://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + account + '&count=5&callback=?',
    function(tweets) {
      var $tweets = $widget.find('.apos-tweets');
      apos.log(tweets);
      if (!tweets.length) {
        return;
      }
      $tweets.find('.apos-tweet:not(.apos-template)').remove();
      _.each(tweets, function(tweet) {
        var text = tweet.text;
        var $li = $tweets.find('.apos-tweet.apos-template').clone();
        var when = new Date(tweet.created_at);
        var month = when.getMonth();
        if (month < 10) {
          month = '0' + month;
        }
        var day = when.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        var when = '<a href="http://twitter.com/' + account + '/status/' + tweet.id_str + '">' + month + '/' + day + '</a>';
        $li.find('.apos-tweet-date').append(when);
        // Linkify URLs
        var text = tweet.text;
        text = text.replace(/(https?\:\/\/[^ ]\S+)/g, '<a href="$1">$1</a>'); 
        // Tweets are pre-escaped for some reason in the JSON responses
        $li.find('.apos-tweet-text').html(text);
        $li.removeClass('apos-template');
        apos.log($li);
        $tweets.append($li);
      });
    }
  );
};

