// TODO: a separate JS file for this since it's needed at all times
// and the editor is not (see editor.js vs. content.js). Letting people
// edit tends to sneak into sites so much that we might not bother
// with the distinction much in practice

apos.widgetPlayers.twitter = function($widget) {
  var data = apos.getWidgetData($widget);
  var account = data.account;
  $.getJSON(
    // Note the trailing ? is significant. It tells jQuery to automatically
    // create a JSONP callback function and obtain the result via a cross-domain
    // script tag so we can talk to twitter in older browsers without a
    // security error
    '/apos-twitter/feed/' + account + '?count=' + (data.limit || 5),
    function(tweets) {
      var $tweets = $widget.find('.apos-tweets');
      if (!tweets.length) {
        return;
      }
      $tweets.find('.apos-tweet:not(.apos-template)').remove();
      _.each(tweets, function(tweet) {
        var text = tweet.text;
        var $li = $tweets.find('.apos-tweet.apos-template').clone();
        var when = parseTwitterDate(tweet.created_at);
        // Months start at zero for use in arrays.
        var month = when.getMonth() + 1;
        if (month < 10) {
          month = '0' + month;
        }
        var day = when.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        when = '<a href="http://twitter.com/' + account + '/status/' + tweet.id_str + '">' + month + '/' + day + '</a>';
        $profileImage = $li.find('.apos-tweet-profile-image');
        $date = $li.find('.apos-tweet-date');
        $date.append(when);
        var profileImage;
        if (document.location.href.substr(0, 5) === 'https') {
          profileImage = tweet.user.profile_image_url_https;
        } else {
          profileImage = tweet.user.profile_image_url;
        }
        $profileImage.css('background-image', 'url(' + profileImage + ')');
        // Linkify URLs
        text = text.replace(/(https?\:\/\/[^ ]\S+)/g, '<a href="$1">$1</a>');
        // Tweets are pre-escaped for some reason in the JSON responses
        $li.find('.apos-tweet-text').html(text);
        $li.removeClass('apos-template');
        $tweets.append($li);
      });
    }
  );

  // Per http://stackoverflow.com/questions/3243546/problem-with-javascript-date-function-in-ie-7-returns-nan
  // Without this IE bombs
  function parseTwitterDate(str) {
    var v = str.split(' ');
    return new Date(Date.parse(v[1]+" "+v[2]+", "+v[5]+" "+v[3]+" UTC"));
  }
};

