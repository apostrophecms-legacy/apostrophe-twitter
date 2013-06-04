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
        $tweets.append($li);
      });
    }
  );
};

