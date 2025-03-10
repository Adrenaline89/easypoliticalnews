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
    const filePath = path.join(OUTPUT_DIR, `news-${timestamp}.md`);
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

    const markdownContent = `---
news:
${analysis.news.map(article => `
  - headline: ${JSON.stringify(article.headline)}
    // ...rest of markdown generation...
`).join('\n')}
dateTime: ${JSON.stringify(analysis.dateTime)}
---`;

    await fs.writeFile(outputPath, markdownContent);
    logger.success(`Markdown file written to: ${outputPath}`);
}
