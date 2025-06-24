// Learn more at developers.reddit.com/docs
import { Devvit, MenuItemOnPressEvent } from '@devvit/public-api';

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

Devvit.addMenuItem({
  label: 'console',
  location: 'comment', // This attaches the action to comments
  forUserType: 'moderator', // Optional: restricts to moderators
  async onPress(event, context) {
    const { approved, approvedAtUtc } = (await context.reddit.getCommentById(event.targetId));
    console.log({ approved, approvedAtUtc });
    context.ui.showToast('check the console');
  },
});

// ---

async function getBanTarget(event: MenuItemOnPressEvent, context: Devvit.Context) {
  if (event.location === 'post') {
    const post = await context.reddit.getPostById(event.targetId);
    return { username: post.authorName, contextId: post.id };
  } else if (event.location === 'comment') {
    const comment = await context.reddit.getCommentById(event.targetId);
    return { username: comment.authorName, contextId: comment.id };
  }
  return { username: '', contextId: '' };
}

const banUserForm = Devvit.createForm(
  data => (
    {
      title: 'Ban a User',
      acceptLabel: 'Ban User',
      cancelLabel: 'Cancel',
      fields: [
        {
          type: 'string',
          name: 'username',
          label: 'Username',
          helpText: 'Reddit username to ban (without u/)',
          defaultValue: data.username ?? '[empty]',
          required: true,
        },
        {
          type: 'number',
          name: 'duration',
          label: 'Duration (days)',
          helpText: 'Number of days to ban the user (leave blank for permanent)',
        },
        {
          type: 'string',
          name: 'message',
          label: 'Ban Message',
          helpText: 'Message to send to the user about the ban',
        },
        {
          type: 'string',
          name: 'note',
          label: 'Mod Note',
          helpText: 'Note for moderators (not visible to the user)',
        },
        {
          type: 'string',
          name: 'reason',
          label: 'Reason',
          helpText: 'Reason for the ban',
        },
        {
          type: 'string',
          name: 'contextId',
          label: 'Context ID',
          helpText: 'ID of the post or comment (optional)',
          defaultValue: data.contextId ?? '[empty]',
          hidden: true, // Hide from user, set programmatically
        },
      ],
    }
  ),
  async (event, context) => {
    const { username, duration, message, note, reason, contextId } = event.values;
    const subreddit = await context.reddit.getCurrentSubreddit();

    await context.reddit.banUser({
      subredditName: subreddit.name,
      username,
      duration: duration ?? 1,
      message,
      note,
      reason,
      context: contextId || undefined,
    });

    context.ui.showToast(`u/${username} has been banned from r/${subreddit.name}.`);
  }
);
// Add the menu item to all locations
Devvit.addMenuItem({
  label: 'Ban a user',
  location: ['subreddit', 'post', 'comment'],
  forUserType: 'moderator',
  onPress: async (event, context) => {
    let initialValues = {};
    if (event.location === 'post' || event.location === 'comment') {
      const { username, contextId } = await getBanTarget(event, context);
      initialValues = { username, contextId };
    }
    context.ui.showForm(banUserForm, initialValues);
  },
});

export default Devvit;
