import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const blogPosts = await getCollection("blogPosts", (post) => {
    return post.id.includes("fr/");
  });
  return rss({
    title: "Thomas Evano | Blog",
    description: "Les aventures d'un développeur français",
    site: context.site,
    items: blogPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>fr-fr</language>`,
  });
}
