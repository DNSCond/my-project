// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true, });

Devvit.addMenuItem({
  label: 'count a account',
  location: 'subreddit', forUserType: 'moderator',
  async onPress(_event, context) {
    context.ui.showToast('received');
    const currentUsername = await context.reddit.getCurrentUsername(), { reddit, subredditName } = context;
    if (currentUsername === undefined) return context.ui.showToast(`there is no currentUser`);
    if (subredditName === undefined) return context.ui.showToast(`there is no subredditName`);
    const author = await reddit.getUserByUsername('Vast_Attention595');
    if (author === undefined) return context.ui.showToast(`there is no currentUsername`);

    const includes = (await author.getPosts({ sort: 'new', limit: 500, after: 't3_1mk28h4' }).all()).map(m => m.id).includes('t3_1mk28h4');

    context.ui.showToast(`includes=${includes};`);
  },
});

export default Devvit;
