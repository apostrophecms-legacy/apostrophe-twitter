// @class Editor for Twitter feed widgets

function AposTwitterWidgetEditor(options) {
  var self = this;

  if (!options.messages) {
    options.messages = {};
  }
  if (!options.messages.missing) {
    options.messages.missing = 'Type in a Twitter account name first.';
  }

  self.type = 'twitter';
  options.template = '.apos-twitter-editor';

  // Parent class constructor shared by all widget editors
  AposWidgetEditor.call(self, options);

  // Now we can override methods
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
}

AposTwitterWidgetEditor.label = 'Twitter';

apos.addWidgetType('twitter');
