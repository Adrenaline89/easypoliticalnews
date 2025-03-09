import { OpenAI } from 'openai';
import { NewsArticle, AnnotatedNews, CitationStep } from '../types';
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
    await logJson('mergeArticlesWithAnalysis', 'analysis', analysis);

    const news = analysis.results.map(analysisItem => {
        if (!analysisItem?.numberedTitle || typeof analysisItem.numberedTitle !== 'string') {
            console.error('Invalid numbered title:', analysisItem);
            return {
                title: 'Unknown',
                numberedTitle: 'Unknown',
                authorByline: 'Unknown',
                pubDate: new Date().toISOString(),
                url: '',
                publication: 'Unknown',
                criteria_matches: []
            };
        }

        const titleParts = analysisItem.numberedTitle.split('. ');
        const articleTitle = titleParts.length > 1 ? titleParts[1] : analysisItem.numberedTitle;
        const matchingArticle = articles.find(article => article.title === articleTitle);
        
        const criteria_matches = [
            ...Object.entries(analysisItem.criteria_matches || {}).map(([source, criteria]) => ({
                source: source as CitationStep,
                criteria
            })),
            ...citations.citations.map(citation => ({
                source: 'citations',
                criteria: citation.links
            }))
        ];

        return {
            title: articleTitle,
            numberedTitle: analysisItem.numberedTitle,
            authorByline: matchingArticle?.authorByline || 'Unknown',
            pubDate: matchingArticle?.pubDate || new Date().toISOString(),
            url: matchingArticle?.url || '',
            publication: matchingArticle?.publication || 'Unknown',
            criteria_matches
        };
    });

    return { news, dateTime: new Date().toISOString() };
}

export function sortAnalysisByMatches(news: AnnotatedNews): AnnotatedNews {
    return {
        results: [...news.results].sort((a, b) => {
            const aTotal = Object.values(a.criteria_matches).reduce((sum, arr) => sum + arr.length, 0);
            const bTotal = Object.values(b.criteria_matches).reduce((sum, arr) => sum + arr.length, 0);
            return bTotal - aTotal;
        })
    };
}
function logJson(arg0: string, arg1: string, analysis: AnnotatedNews) {
    throw new Error('Function not implemented.');
}

