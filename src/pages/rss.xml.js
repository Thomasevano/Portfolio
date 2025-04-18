import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection("posts", (post) => {
    return post.id.includes("fr/");
  });
  return rss({
    title: 'Thomas Evano | Blog',
    description: 'Just a french software engineer adventures',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>fr-fr</language>`,
  });
}