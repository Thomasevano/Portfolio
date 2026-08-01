import type { CollectionEntry } from "astro:content";

/**
 * Draft posts (frontmatter `draft: true`, the schema default) are meant to
 * be committed and pushed without going live: they ship inside the built
 * dist/ output but stay unreachable from every production route (listing,
 * tags, RSS, and the post's own page). Flipping to `draft: false` and
 * pushing is the entire "publish" action — the next Coolify build makes it
 * live everywhere.
 *
 * `astro dev` renders drafts regardless, so a post can be previewed locally
 * before that flip.
 */
export function isPublished(post: CollectionEntry<"blogPosts">): boolean {
  return import.meta.env.DEV || !post.data.draft;
}
