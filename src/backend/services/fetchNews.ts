import axios from 'axios';
import { NewsArticle } from '../types';

export const PERIGON_API_URL = "https://api.goperigon.com/v1/all";
export const POLITICAL_KEYWORDS = [
    'taxes', 'congress', 'senate', 'white house', 'senator', 'congressman',
    // ...existing keywords...
];

export async function checkPerigonHealth(apiKey: string): Promise<boolean> {
    try {
        const response = await axios.get(PERIGON_API_URL, {
            params: {
                apiKey,
                q: "test",
                language: "en",
                per_page: 1
            },
            timeout: 5000
        });
        return Boolean(response?.data?.articles);
    } catch (error) {
        console.error('Perigon API health check failed:', error);
        return false;
    }
}

export async function fetchNews(apiKey: string): Promise<NewsArticle[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const promises = POLITICAL_KEYWORDS.map(keyword =>
        axios.get<{ articles: NewsArticle[] }>(PERIGON_API_URL, {
            params: {
                apiKey,
                q: keyword,
                from: today.toISOString(),
                language: "en",
                page: 1,
                per_page: 3,
            }
        })
    );

    try {
        const responses = await Promise.allSettled(promises);
        const allArticles = responses
            .filter((response): response is PromiseFulfilledResult<any> => response.status === 'fulfilled')
            .flatMap(response => response.value.data.articles)
            .map(({ title, authorByline, pubDate, url }, index) => ({
                title,
                numberedTitle: `${index + 1}. ${title}`,
                authorByline,
                pubDate,
                url
            }));

        return Array.from(new Map(allArticles.map(article => [article.title, article])).values());
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}
