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
  tags: z.array(z.string())
})

const blogPosts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/posts" }),
  schema: postSchema,
});

export const collections = { blogPosts, aboutMe };
export type aboutMeType = z.infer<typeof aboutMeSchema>
