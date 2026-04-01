// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
// getTrophies

Devvit.configure({ redditAPI: true, });

Devvit.addMenuItem({
  label: 'getTrophies',
  location: 'subreddit',
  async onPress(_event, context) {
    context.ui.showToast('received');
    const currentUser = await context.reddit.getCurrentUser(), { reddit, subredditName } = context;
    if (currentUser === undefined) return context.ui.showToast(`there is no currentUser`);
    if (subredditName === undefined) return context.ui.showToast(`there is no subredditName`);

    const trophies = await currentUser.getTrophies();
    console.log(JSON.stringify(trophies, null, 2));

    context.ui.showToast(String(Array.from(trophies, trophy => trophy.name)).replace(/,/g, ', '));
  },
});

export default Devvit;
