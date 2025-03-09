import { NewsArticle, AnnotatedNews, CitationStep, CompleteAnnotatedNews, CriteriaMatch } from '../types';
import { SimpleCitationResult } from './citations';

interface AnnotatedNewsItem extends NewsArticle {
    criteria_matches: CriteriaMatch[];
}

// Helper interfaces for substeps
interface ArticleMetadata {
    title: string;
    numberedTitle: string;
    authorByline: string;
    pubDate: string;
    url: string;
    publication: string;
}

/**
 * Step 1: Extract article title
 * Input: numberedTitle (e.g. "1. Article Title")
 * Output: clean title (e.g. "Article Title")
 * Affects: title field in ArticleMetadata
 * 
 * Input Types:
 * numberedTitle: string (e.g. "1. Article Title")
 * 
 * Output Type:
 * string (e.g. "Article Title")
 */
export function extractArticleTitle(numberedTitle: string | undefined | null): string {
    if (!numberedTitle || typeof numberedTitle !== 'string') {
        console.error('Invalid numberedTitle:', numberedTitle);
        return 'Unknown Title';
    }
    
    const titleParts = numberedTitle.split('. ');
    return titleParts.length > 1 ? titleParts.slice(1).join('. ') : numberedTitle;
}

/**
 * Step 2: Find matching article metadata
 * Input: title string, articles array
 * Output: ArticleMetadata object
 * Affects: title, numberedTitle, authorByline, pubDate, url, publication
 * 
 * Input Types:
 * title: string
 * articles: NewsArticle[]
 * 
 * Output Type:
 * ArticleMetadata: {
 *   title: string;
 *   numberedTitle: string;
 *   authorByline: string;
 *   pubDate: string;
 *   url: string;
 *   publication: string;
 * }
 */
export function findMatchingArticle(title: string, articles: NewsArticle[]): ArticleMetadata {
    const matchingArticle = articles.find(article => article.title === title);
    return {
        title: title,
        numberedTitle: matchingArticle?.numberedTitle || '',
        authorByline: matchingArticle?.authorByline || 'Unknown',
        pubDate: matchingArticle?.pubDate || new Date().toISOString(),
        url: matchingArticle?.url || '',
        publication: matchingArticle?.publication || 'Unknown'
    };
}

/**
 * Step 3: Match criteria with citations
 * Input: criteria array, source string, citations
 * Output: CriteriaMatch object
 * Affects: source and criteria (with criteria_name and url) fields
 */
export function matchCriteriaWithCitations(
    criteria: string[], 
    source: string, 
    citations: SimpleCitationResult
): CriteriaMatch {
    const matchingCitation = citations.citations.find(c => c.step === source);
    return {
        source: source as CitationStep,
        criteria: criteria.map(c => ({
            criteria_name: c,
            url: matchingCitation?.links[0] || ''
        }))
    };
}

/**
 * Transform 1: Process headline criteria matches
 * Input: headline_criteria_matches object from analysis
 * Output: Array of CriteriaMatch objects
 * Affects: criteria_matches array in AnnotatedNewsItem
 * 
 * Input Types:
 * headline_criteria_matches: { [key: string]: string[] } | undefined
 * citationResult: SimpleCitationResult { citations: { step: string; links: string[] }[] }
 * 
 * Output Type:
 * CriteriaMatch[]: Array<{
 *   source: CitationStep;
 *   criteria: CriteriaAndLink[];
 * }>
 */
export function processCriteriaMatches(
    headline_criteria_matches: { [key: string]: string[] } | undefined,
    citationResult: SimpleCitationResult
): CriteriaMatch[] {
    if (!headline_criteria_matches) return [];
    
    return Object.entries(headline_criteria_matches)
        .map(([source, criteria]) => 
            matchCriteriaWithCitations(criteria, source, citationResult)
        );
}

/**
 * Transform 2: Build complete news item
 * Input: metadata and criteria_matches
 * Output: Complete AnnotatedNewsItem
 * Affects: all fields in AnnotatedNewsItem including metadata and criteria_matches
 */
export function buildAnnotatedNewsItem(
    metadata: ArticleMetadata,
    criteria_matches: CriteriaMatch[]
): AnnotatedNewsItem {
    return {
        ...metadata,
        criteria_matches
    };
}

/**
 * Transform 3: Create final analysis object
 * Input: Array of AnnotatedNewsItem
 * Output: CompleteAnnotatedNews
 * Affects: news array and dateTime fields in CompleteAnnotatedNews
 */
export function createCompleteAnalysis(
    news: AnnotatedNewsItem[]
): CompleteAnnotatedNews {
    return {
        news,
        dateTime: new Date().toISOString()
    };
}

/**
 * Final Output Type:
 * CompleteAnnotatedNews: {
 *   news: AnnotatedNewsItem[];
 *   dateTime: string;
 * }
 * 
 * Where AnnotatedNewsItem extends NewsArticle with:
 * criteria_matches: CriteriaMatch[]
 */
export function mergeArticlesWithAnalysis3(
    articles: NewsArticle[],
    sortedAnalysis: AnnotatedNews,
    citationResult: SimpleCitationResult
): CompleteAnnotatedNews {
    const news = sortedAnalysis.results.map(analysisItem => {
        const title = extractArticleTitle(analysisItem.numberedTitle);
        const metadata = findMatchingArticle(title, articles);
        const criteria_matches = processCriteriaMatches(
            analysisItem.headline_criteria_matches,
            citationResult
        );
        return buildAnnotatedNewsItem(metadata, criteria_matches);
    });

    return createCompleteAnalysis(news);
}
