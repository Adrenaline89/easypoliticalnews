// @ts-ignore
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({image}) => z.object({
    title: z.string(),
    featuredImage: image(),
    imgAlt: z.string(),
    excerpt: z.string(),
    // tags: z.array(z.string()),
    publishedDate: z.date(),
  }),
});

const news = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string(), // ✅ Kept as `string` since it's a date string

    // ✅ Refactored to correctly validate an array of news items
    distraction: z.array(
      z.object({
        title: z.string(),
        author: z.string(),
        datetime: z.string(), // Keeping it as a string for ISO format
        link: z.string().url(),
        publication: z.string(),
      })
    ),

    important: z.array(
      z.object({
        title: z.string(),
        author: z.string(),
        datetime: z.string(),
        link: z.string().url(),
        publication: z.string(),
      })
    ),
  }),
});


export const collections = { posts, news };
