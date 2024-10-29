// Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const aboutMeSchema = z.object({
  name: z.string(),
  role: z.string(),
  linkedin: z.string().url(),
  github: z.string().url(),
  twitter: z.string().url(),
  mail: z.string().email().optional(),
  resumeLink: z.array(z.object({})),
  skills: z.array(z.string())
})

const aboutMe = defineCollection({
  type: 'data',
  schema: aboutMeSchema
})

const blog = defineCollection({
  type: 'content',
  schema: rssSchema,
});

export const collections = { blog, 'about': aboutMe };
export type aboutMeType = z.infer<typeof aboutMeSchema>
