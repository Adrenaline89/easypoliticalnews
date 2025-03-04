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
    date: z.string(),
    distraction: z.object({
      title: z.string(),
      author: z.string(),
      datetime: z.string(),
      link: z.string().url(),
      publication: z.string(),
    }),
    important: z.object({
      title: z.string(),
      author: z.string(),
      datetime: z.string(),
      link: z.string().url(),
      publication: z.string(),
    }),
  }),
});

export const collections = { posts, news };
