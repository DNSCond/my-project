// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true, });

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    if (event === undefined || event.post === undefined) return;
    await context.reddit.submitComment({
      id: event.post.id,
      text: `the current Date is ${Date()}`
    });
  },
});

export default Devvit;
