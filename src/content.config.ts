import { defineCollection, z } from 'astro:content';
import { rssSchema } from '@astrojs/rss';
import { glob } from 'astro/loaders';

const aboutMeSchema = z.object({
  name: z.string(),
  role: z.string(),
  linkedin: z.string().url(),
  github: z.string().url(),
  twitter: z.string().url(),
  bluesky: z.string().url(),
  skills: z.array(z.string())
})

const aboutMe = defineCollection({
  loader: glob({ pattern: '**/aboutMe.json', base: "./src/content/data" }),
  schema: aboutMeSchema
})

const postSchema = rssSchema.extend({
  tags: z.array(z.string())
})

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/posts" }),
  schema: postSchema,
});

export const collections = { blog, aboutMe };
export type aboutMeType = z.infer<typeof aboutMeSchema>
