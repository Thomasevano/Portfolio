// Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

const aboutMe = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    linkedin: z.string().url(),
    github: z.string().url(),
    twitter: z.string().url(),
    mail: z.string().email().optional(),
    resumeLink: z.array(z.object({})),
    skills: z.array(z.string())
  })
})

export const collections = { 'about': aboutMe };
