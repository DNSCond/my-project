// Learn more at developers.reddit.com/docs
import { Devvit, User } from '@devvit/public-api';
import { jsonEncodeIndent } from 'anthelpers';

Devvit.configure({ redditAPI: true, });

type BookTitle = string;
type ChapterId = { chapterPostId: string, chapterTitle: string };
type UserBook = {
  bookTitle: string,
  chapters: Record<number, ChapterId>,
};
type UserData = {
  books: Record<BookTitle, UserBook>,
};
function normalize(strings: string[]): { normalized: string[], keys: string[] } {
  const normalized = strings.map(m => m.trim().replaceAll(/\s+/g, ' ')),
    keys = normalized.map(m => m.toLocaleLowerCase());
  return { normalized, keys };
}

Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    const appUser = await context.reddit.getAppUser(); let author: User | undefined;
    const authorId = event.author?.id, postId = event.post?.id;
    if (authorId) author = await context.reddit.getUserById(authorId);
    else return console.log('no media autor');
    if (author?.id === appUser.id) {
      console.log('i do not reply to myself');
      return;
    }
    if (typeof postId !== 'string') {
      console.log('postId want a string');
      return;
    }
    if (!author) return console.log('author want a User'); const authorName = author.username;
    const { title, body } = (await context.reddit.getPostById(postId)) ?? {}, id = postId;
    if (title === undefined || body === undefined) return console.log('title or body was undefined');
    const regexp = /<([^>]+)>\s*\[(\d+):\s*([^\]]+)]/, regexMatchArray = String(title).match(regexp);
    if (regexMatchArray === null) return console.log(`title did not match ${regexp}`);

    const [, bookTitle_raw, chapterIndex1_raw, chapterTitle_raw] = regexMatchArray;
    const chapterIndex1 = +chapterIndex1_raw;//, arrayToUpdate = [];
    if (!Number.isSafeInteger(chapterIndex1)) return console.log(`chapterIndex1 isnt a SafeInteger`);

    const { normalized, keys } = normalize([bookTitle_raw, chapterTitle_raw]);
    const [bookTitle, chapterTitle] = normalized, [bookTitle_Lowercase] = keys;
    const json = JSON.parse((await context.redis.get(authorId)) ?? '{"books":{}}') as UserData;

    const book: UserBook = json?.books?.[bookTitle_Lowercase] ?? { chapters: {}, bookTitle },
      chapterExists = Object.hasOwn(book.chapters, chapterIndex1); let contents: string[] = [];
    book.chapters[chapterIndex1] = { chapterPostId: postId, chapterTitle, };
    json.books[bookTitle_Lowercase] = book;
    await context.redis.set(authorId, JSON.stringify(json));

    for (const key in book.chapters) {
      if (Object.prototype.hasOwnProperty.call(book.chapters, key) && isFinite(key as unknown as number)) {
        const element = book.chapters[key];
        let flags = `${String(chapterIndex1) === key ? '(This)' : ''} ${chapterExists ? '(overwritten)' : ''}`.replaceAll(/\s+/g, ' ').trim();
        if (flags.length > 0) flags = ' ' + flags;
        contents.push(`${key}\\. [Chapter ${key}: ${element.chapterTitle}${flags}](https://reddit.com/comments/${element.chapterPostId.replace(/t\d+_/, '')})  `);
        //arrayToUpdate.push(element);
      }
    }
    (await context.reddit.submitComment({
      id, text: `This is chapter ${chapterIndex1} of "${bookTitle}" by u/${authorName}.\n\n${contents.join('\n')}`,
    })).distinguish(true);

    // for (const key in book.chapters) {
    //   if (Object.prototype.hasOwnProperty.call(book.chapters, key) && isFinite(key as unknown as number)) {
    //     const element = book.chapters[key];
    //     let flags = `${String(chapterIndex1) === key ? '(This)' : ''} ${chapterExists ? '(overwritten)' : ''}`.replaceAll(/\s+/g, ' ').trim();
    //     if (flags.length > 0) flags = ' ' + flags;
    //     contents.push(`${key}\\. [Chapter ${key}: ${element.chapterTitle}${flags}](https://reddit.com/comments/${element.chapterPostId.replace(/t\d+_/, '')})  `);
    //   }
    // }
  },
});

// templateString
const templateRegExp = /\{\{[a-zA-Z0-9\-_.]+}}/g;

function templateString(string: string, object: any) {
  return String(string).replace(templateRegExp, function (match) {
    const key = match.slice(2, -2);
    let result = Object.hasOwn(object, key) ? object[key] : undefined;
    if (result === undefined && Object.hasOwn(object, 'callback') && typeof object.callback === 'function') {
      result = object.callback(object, key);
    }
    if (result !== undefined) return String(result);
    return String(match);
  });
}

Devvit.addMenuItem({
  label: 'Update Mod Stats Now (immediately)',
  description: 'do whatever is timed NOW',
  location: 'subreddit',
  async onPress(_event, context) {
    console.log(await context.redis.get(context.userId as string));
    console.log(await context.redis.del(context.userId as string));
    context.ui.showToast('sucess');
  },
});

export default Devvit;
