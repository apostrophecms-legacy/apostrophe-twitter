# apos-twitter

apostrophe-twitter is a widget for the [Apostrophe](http://github.com/punkave/apostrophe) content management system. apostrophe-twitter lets you add a Twitter feed to any content area created with Apostrophe. apostrophe-twitter is also intended as a demonstration of how to add custom widgets to Apostrophe and enable their use in your project. See [apostrophe-sandbox](http://github.com/punkave/apostrophe-sandbox) for a project that demonstrates how to use apostrophe-twitter.

Due to Twitter's API access policies, you must [register a Twitter "app"](https://dev.twitter.com/) to use this module. The `consumerKey` and `consumerSecret`, `accessToken` and `accessTokenSecret` options must be set when initializing the module. After registering your app on dev.twitter.com, click "create my access token." Then refresh the page as Twitter usually fails to display the token on the first try.

This widget has just one option: `limit`. This controls the number of tweets to be displayed, at most. The `limit` option defaults to `5`.

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

Enjoy!
