// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';
import { jsonEncode } from 'anthelpers';

Devvit.configure({ redditAPI: true, });

Devvit.addMenuItem({
  label: 'Say Hello',
  location: 'subreddit', // This makes it appear in the subreddit menu
  async onPress(_event, context) {
    context.ui.showToast('Hello from the subreddit menu!');
    const subredditId = (await context.reddit.getCurrentSubreddit()).id;
    context.reddit.modMail.createModInboxConversation({
      subredditId, subject: 'createModInboxConversation',
      bodyMarkdown: Date(),
    });
  },
});

export default Devvit;
