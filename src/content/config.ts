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



const newsArticleSchema = z.object({
  headline: z.string(),
  authorByline: z.string(),
  url: z.string().url(),
  publication: z.string(),
  pubDateTime: z.string().datetime(),
  criteria_matches: z
    .array(
      z.object({
        source: z.string(),
        criteria: z.array(z.string()),
      })
    )
    .optional(),
});

const newsCollectionSchema = z.object({
  news: z.array(newsArticleSchema),
});

const news = defineCollection({
  schema: newsCollectionSchema,
});


export const collections = { posts: posts, news };
