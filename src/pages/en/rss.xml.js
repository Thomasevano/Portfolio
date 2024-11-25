import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection("posts", (post) => {
    return post.data.draft !== true && post.id.includes("en/");
  });
  return rss({
    title: 'Thomas Evano | Blog | EN',
    description: 'Just a french software engineer adventures',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/en/posts/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}