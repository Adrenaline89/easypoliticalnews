import { OpenAI } from 'openai';
import { NewsArticle, AnnotatedNews, CitationStep, CriteriaMatch } from '../types';
import { CompleteAnnotatedNews } from '../types';
import { SimpleCitationResult } from './citations';
import { logger } from './logger';

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

/**
 * Creates a CompleteAnnotatedNews by merging news articles with analysis results and citations
 * 
 * @param articles - Original news articles from API
 * @param sortedAnalysis - Analysis results with criteria matches
 * @param citationResult - Citation data from database
 * @returns CompleteAnnotatedNews with properly structured data
 */
export function mergeArticlesWithAnalysis2(
    articles: NewsArticle[],
    sortedAnalysis: AnnotatedNews,
    citationResult: SimpleCitationResult
  ): CompleteAnnotatedNews {
    // STEP 1: Map each analysis result to a properly structured AnnotatedNewsItem
    const news = sortedAnalysis.results.map(analysisItem => {
      // STEP 2: Extract article title from the numbered title (e.g., "1. Title" -> "Title")
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
  
      // Parse out the title without number prefix
      const titleParts = analysisItem.numberedTitle.split('. ');
      const articleTitle = titleParts.length > 1 ? titleParts.slice(1).join('. ') : analysisItem.numberedTitle;
      
      // STEP 3: Find the matching original article to get full metadata
      const matchingArticle = articles.find(article => article.title === articleTitle) || {
        title: articleTitle,
        numberedTitle: analysisItem.numberedTitle,
        authorByline: 'Unknown',
        pubDate: new Date().toISOString(),
        url: '',
        publication: 'Unknown'
      };
  
      // STEP 4: Process headline_criteria_matches to create properly structured criteria_matches
      const criteria_matches: CriteriaMatch[] = [];
      
      if (analysisItem.headline_criteria_matches) {
        // STEP 5: For each source/category and its criteria list
        Object.entries(analysisItem.headline_criteria_matches).forEach(([source, criteriaList]) => {
          // Skip if empty criteria list
          if (!criteriaList || criteriaList.length === 0) return;
          
          // STEP 6: Find matching citation by comparing source with citation step
          const matchingCitations = citationResult.citations.filter(citation => 
            citation.step === source
          );
          
          // STEP 7: Create CriteriaAndLink objects for each criteria
          const criteriaWithLinks = criteriaList.map(criteriaText => {
            // Find a matching citation, if any
            const matchingCitation = matchingCitations.length > 0 ? matchingCitations[0] : null;
            
            // Create CriteriaAndLink with URL if available
            return {
              criteria_name: criteriaText,
              url: matchingCitation && matchingCitation.links.length > 0 ? 
                   matchingCitation.links[0] : ''
            };
          });
          
          // STEP 8: Add new CriteriaMatch entry with source and criteria
          criteria_matches.push({
            source: source as CitationStep, // Type assertion to match required type
            criteria: criteriaWithLinks
          });
        });
      }
  
      // STEP 9: Return combined data as AnnotatedNewsItem
      return {
        title: matchingArticle.title,
        numberedTitle: analysisItem.numberedTitle,
        authorByline: matchingArticle.authorByline,
        pubDate: matchingArticle.pubDate,
        url: matchingArticle.url,
        publication: matchingArticle.publication || 'Unknown',
        criteria_matches: criteria_matches
      };
    });
  
    // STEP 10: Return the final CompleteAnnotatedNews object with current timestamp
    return {
      news,
      dateTime: new Date().toISOString()
    };
  }

export function mergeArticlesWithAnalysis(
    articles: NewsArticle[], 
    analysis: AnnotatedNews,
    citations: SimpleCitationResult
): CompleteAnnotatedNews {
    // Log function name and analysis variable
    logger.info(`Function: ${mergeArticlesWithAnalysis.name}, Variable: analysis`);
    logger.info(JSON.stringify(analysis, null, 2));

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
        
        const criteria_matches = Object.entries(analysisItem.headline_criteria_matches || {}).flatMap(([source, criteriaList]) => {
            const matchingCitation = citations.citations.find(c => c.step === source);
            if (!matchingCitation) return [];

            return [{
                source: source as CitationStep,
                criteria: criteriaList.map(criteria => ({
                    criteria_name: criteria,
                    url: matchingCitation.links[0] || ''
                }))
            }];
        });

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

    const result = { news, dateTime: new Date().toISOString() };
    
    // Log output
    logger.info('mergeArticlesWithAnalysis output:');
    logger.info(JSON.stringify(result, null, 2));

    return result;
}

export function sortAnalysisByMatches(news: AnnotatedNews): AnnotatedNews {
    return {
        results: [...news.results].sort((a, b) => {
            const aTotal = Object.values(a.headline_criteria_matches || {}).reduce((sum, arr) => sum + arr.length, 0);
            const bTotal = Object.values(b.headline_criteria_matches || {}).reduce((sum, arr) => sum + arr.length, 0);
            return bTotal - aTotal;
        })
    };
}

