import { OpenAI } from 'openai';
import { NewsArticle, AnnotatedNews } from '../types';
import { CompleteAnnotatedNews } from '../types';
import { SimpleCitationResult } from './citations';

export async function checkOpenAIHealth(apiKey: string): Promise<boolean> {
    try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: "test" }],
            max_tokens: 5,
            temperature: 0
        });
        return Boolean(response.choices?.[0]?.message?.content);
    } catch (error) {
        console.error('OpenAI API health check failed:', error);
        return false;
    }
}

export async function analyzeNewsWithGPT(
    articles: NewsArticle[], 
    prompt: string, 
    apiKey: string
): Promise<AnnotatedNews> {
    const openai = new OpenAI({ apiKey });
    const headlines = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt + headlines }],
            temperature: 0,
        });

        const parsedResponse = JSON.parse(response.choices[0]?.message?.content || "{}") as AnnotatedNews;
        if (!parsedResponse.results) {
            throw new Error("Invalid response format from GPT");
        }
        return parsedResponse;
    } catch (error) {
        console.error("Error analyzing news:", error);
        return { results: [] };
    }
}

export function createNumberedTitlesString(articles: NewsArticle[]): string {
    return articles
        .map((article, index) => `${index + 1}. ${article.title}`)
        .join('\n');
}

export function mergeArticlesWithAnalysis(
    articles: NewsArticle[], 
    analysis: AnnotatedNews,
    citations: SimpleCitationResult
): CompleteAnnotatedNews {
    const news = analysis.results.map(analysisItem => {
        const articleTitle = analysisItem.numberedTitle.split('. ')[1];
        const matchingArticle = articles.find(article => article.title === articleTitle);
        const relevantCitations = citations.citations.filter(citation => 
            analysisItem.criteria_matches[citation.step]?.length > 0
        );

        return {
            headline: articleTitle,
            authorByline: matchingArticle?.authorByline || 'Unknown',
            url: matchingArticle?.url || '',
            publication: 'Unknown',
            pubDateTime: matchingArticle?.pubDate || new Date().toISOString(),
            criteria_matches: [
                ...Object.entries(analysisItem.criteria_matches).map(([source, criteria]) => ({
                    source,
                    criteria
                })),
                ...relevantCitations.map(citation => ({
                    source: 'citations',
                    criteria: citation.links
                }))
            ]
        };
    });

    return {
        news,
        dateTime: new Date().toISOString()
    };
}

export function sortAnalysisByMatches(news: AnnotatedNews): AnnotatedNews {
    return {
        results: [...news.results].sort((_a, b) => {
            // ...existing sort logic...
        })
    };
}
