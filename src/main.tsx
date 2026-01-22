// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true, });

Devvit.addMenuItem({
  label: 'cross-orgin approve',
  location: 'subreddit',// forUserType: 'moderator',
  async onPress(_event, context) {
    context.ui.showToast('received');
    const currentUsername = await context.reddit.getCurrentUsername(), { reddit, subredditName } = context;
    if (currentUsername === undefined) return context.ui.showToast(`there is no currentUser`);
    if (subredditName === undefined) return context.ui.showToast(`there is no subredditName`);

    if (currentUsername !== 'Fun_Percentage5387') return context.ui.showToast(`not you`);

    await reddit.approveUser(currentUsername, 'parawall_block_dev');
    context.ui.showToast(`Done Check Your Chat`);
  },
});

export default Devvit;
