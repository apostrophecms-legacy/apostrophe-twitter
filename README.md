# apos-twitter

apostrophe-twitter is a widget for the [Apostrophe](http://github.com/punkave/apostrophe) content management system. apostrophe-twitter lets you add a Twitter feed to any content area created with Apostrophe. apostrophe-twitter is also intended as a demonstration of how to add custom widgets to Apostrophe and enable their use in your project. See [apostrophe-sandbox](http://github.com/punkave/apostrophe-sandbox) for a project that demonstrates how to use apostrophe-twitter.

### Code Stability

0.4.x releases receive bug fixes only. For active development, follow 0.5.x releases and/or the master branch in github.

## Requirements

Due to Twitter's API access policies, you must [register a Twitter "app"](https://dev.twitter.com/) to use this module. The `consumerKey` and `consumerSecret`, `accessToken` and `accessTokenSecret` options must be set when initializing the module. After registering your app on dev.twitter.com, click "create my access token." Then refresh the page as Twitter usually fails to display the token on the first try.
nodemon## Setup

If you are using `apostrophe-site` (and you should be), adding this module is as simple as:

npm install apostrophe-twitter

And in your app.js file:

    modules: {
      ... other modules ...
      'apostrophe-twitter': {
        consumerKey: 'get',
        consumerSecret: 'your',
        accessToken: 'own',
        accessTokenSecret: 'credentials'
      },
      ... yet more modules ...
    }

Now it will be included in the default set of controls. If you are setting the `controls` option on your areas, the widget's name is `twitter`.

To insert it as a singleton, you might write:

    {{ aposSingleton({
      slug: page.slug + ':twitter',
      area: page.areas.twitter,
      type: 'twitter',
      limit: 3
    }) }}

If you want the same feed to appear on many pages, you might use the `global` virtual page:

  {{ aposSingleton({
    slug: 'global:twitter',
    area: global.areas.twitter,
    type: 'twitter',
    limit: 3
  }) }}

## Options

### limit

The `limit` option controls the number of tweets to be displayed, at most. The `limit` option defaults to `5`.

## Displaying Profile Pictures

By default the profile picture is present but hidden by CSS. You can override this by setting the `apos-tweet-profile-image` class to `display: block` at project level. The background image of that div is the user's profile picture. Keep in mind they are only 48x48.

Enjoy!
