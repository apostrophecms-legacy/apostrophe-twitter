apos.widgetPlayers.twitter = function($widget) {
  var data = apos.getWidgetData($widget);
  var account = data.account;
  var hashtag = data.hashtag;

  $.getJSON(
    '/apos-twitter/feed',
    {
      count: (data.limit || 5),
      username: account,
      hashtag: hashtag
    },
    function(tweets) {
      var $tweets = $widget.find('.apos-tweets, [data-apos-tweets]');

      if (!tweets.length) {
        $widget.trigger('aposTwitterNull');
        return;
      }
      $tweets.find('.apos-tweet:not(.apos-template), [data-apos-tweet-place-holer]').remove();
      _.each(tweets, function(tweet) {
        var text = tweet.text;
        var $li = $tweets.find('.apos-tweet.apos-template, [data-apos-tweet].apos-template').clone();

        var username = tweet.user.screen_name;
        var $username = $li.find('[data-apos-tweet-username]');
        $username.text("@"+username);

        var profileUrl = "http://twitter.com/"+ username;
        var $profileLink = $li.find('[data-apos-tweet-profile-link]');
        $profileLink.attr('href', profileUrl);

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
        var url = "http://twitter.com/" + account + "/status/" + tweet.id_str;
        when = '<a href="'+ url+ '">' + month + '/' + day + '</a>';
        $profileImage = $li.find('.apos-tweet-profile-image, [data-apos-tweet-profile-image]');
        $date = $li.find('.apos-tweet-date, [data-apos-tweet-date]');
        $date.append(when);

        var $link = $li.find('[data-apos-tweet-link]');
        $link.attr('href', url);
        var profileImage;
        if (document.location.href.substr(0, 5) === 'https') {
          profileImage = tweet.user.profile_image_url_https;
        } else {
          profileImage = tweet.user.profile_image_url;
        }
        $profileImage.css('background-image', 'url(' + profileImage + ')');

        // Grabbing any associated images
        var photos = (tweet.entities.media || []);
        if (photos.length) {
          photos.map(function(photo){
            var photoSrc;
            if (document.location.href.substr(0, 5) === 'https') {
              photoSrc = photo.media_url_https;
            } else {
              photoSrc = photo.media_url;
            }
            $li.find('[data-apos-tweet-images]').append('<li><img src="'+photoSrc+'" alt="'+photo.display_url+'"></li>');
          });
        }

        // Linkify URLs
        text = text.replace(/https?\:\/\/\S+/g, function(url) {
          var urlSansPeriod = url.replace(/\.$/, '');
          return '<a href="' + urlSansPeriod + '" target="blank">' + url + '</a>';
        });
        // Tweets are pre-escaped for some reason in the JSON responses
        text = text.replace(/(^|[^@\w])@(\w{1,15})\b/g, '$1<a href="http://twitter.com/$2" target="blank">@$2</a>');
        $li.find('.apos-tweet-text, [data-apos-tweet-text]').html(text);
        $li.removeClass('apos-template');
        $tweets.append($li);
      });
      $tweets.find('.apos-tweet.apos-template, [data-apos-tweet].apos-template').remove();
      $widget.trigger('aposTwitterReady');
    }
  );

  // Per http://stackoverflow.com/questions/3243546/problem-with-javascript-date-function-in-ie-7-returns-nan
  // Without this IE bombs
  function parseTwitterDate(str) {
    var v = str.split(' ');
    return new Date(Date.parse(v[1]+" "+v[2]+", "+v[5]+" "+v[3]+" UTC"));
  }
};
