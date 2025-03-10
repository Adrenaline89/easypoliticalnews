import fs from 'fs-extra';
import path from 'path';
import { CompleteAnnotatedNews } from '../types';
import { logger } from './logger';

const OUTPUT_DIR = path.join(__dirname, "../../../src/content/");

export function generateMarkdownPath(): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
    const filePath = path.join(OUTPUT_DIR, `news-${timestamp}.mdoc`);  // Changed back to .md
    logger.info(`Generated markdown path: ${filePath}`);
    return filePath;
}

export async function writeMarkdownFile(analysis: CompleteAnnotatedNews): Promise<void> {
    const outputPath = generateMarkdownPath();
    
    // Log analysis object - Used by mergeArticlesWithAnalysis3 in mergeArticles.ts
    logger.info('Analysis object received in writeMarkdownFile:');
    logger.info(JSON.stringify(analysis, null, 2));

    logger.info(`Writing markdown to: ${outputPath}`);
    await fs.ensureDir(path.dirname(outputPath));

    const yamlContent = [
        '---',
        'news:',
        ...analysis.news.map(article => [
            '  - title: ' + JSON.stringify(article.title),
            '    numberedTitle: ' + JSON.stringify(article.numberedTitle),
            '    authorByline: ' + JSON.stringify(article.authorByline),
            '    pubDate: ' + JSON.stringify(article.pubDate),
            '    url: ' + JSON.stringify(article.url),
            '    publication: ' + JSON.stringify(article.publication),
            '    criteria_matches:',
            ...article.criteria_matches.map(match => [
                '      - source: ' + JSON.stringify(match.source),
                '        criteria:',
                ...match.criteria.map(c => [
                    '          - criteria_name: ' + JSON.stringify(c.criteria_name),
                    '            url: ' + JSON.stringify(c.url)
                ].join('\n'))
            ].join('\n'))
        ].join('\n')),
        'dateTime: ' + JSON.stringify(analysis.dateTime),
        '---',
        '',
        '<!-- Content will be added here -->'
    ].join('\n');

    await fs.writeFile(outputPath, yamlContent);
    logger.success(`Markdown file written to: ${outputPath}`);
}
