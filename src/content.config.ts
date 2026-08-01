import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { rssSchema } from '@astrojs/rss';
import { glob } from 'astro/loaders';

const aboutMeSchema = z.object({
  name: z.string(),
  role: z.string(),
  linkedin: z.url(),
  github: z.url(),
  twitter: z.url(),
  bluesky: z.url(),
  skills: z.array(z.string())
})

const aboutMe = defineCollection({
  loader: glob({ pattern: '**/aboutMe.json', base: "./src/content/data" }),
  schema: aboutMeSchema
})

const postSchema = rssSchema.extend({
  tags: z.array(z.string()),
  // Commit and push freely with draft: true — the post ships in every
  // build's dist/ but stays out of every production route (listing, tags,
  // RSS, and its own page 404s) until it flips to draft: false. `astro dev`
  // renders drafts anyway so they can be previewed locally before that.
  draft: z.boolean().default(true),
})

const blogPosts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/posts" }),
  schema: postSchema,
});

export const collections = { blogPosts, aboutMe };
