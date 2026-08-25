import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "../i18n/utils";

export type BlogPost = CollectionEntry<"blogPosts">;

/**
 * Draft posts (frontmatter `draft: true`, the schema default) are meant to
 * be committed and pushed without going live: they ship inside the built
 * dist/ output but stay unreachable from every production route (listing,
 * tags, RSS, and the post's own page). Flipping to `draft: false` and
 * pushing is the entire "publish" action.
 *
 * `astro dev` renders drafts regardless, so a post can be previewed locally
 * before that flip.
 */
export function isPublished(post: BlogPost): boolean {
  return import.meta.env.DEV || !post.data.draft;
}

export function postSlug(post: BlogPost): string {
  return post.id.slice(post.id.indexOf("/") + 1);
}

export function postLanguage(post: BlogPost): Lang {
  return post.id.slice(0, post.id.indexOf("/")) as Lang;
}

export async function getPublishedPosts(lang?: Lang): Promise<BlogPost[]> {
  return getCollection(
    "blogPosts",
    (post) => isPublished(post) && (!lang || postLanguage(post) === lang)
  );
}

export async function getPostTranslations(slug: string, lang: Lang): Promise<Lang[]> {
  const posts = await getPublishedPosts();
  return posts
    .filter((post) => postLanguage(post) !== lang && postSlug(post) === slug)
    .map(postLanguage);
}
