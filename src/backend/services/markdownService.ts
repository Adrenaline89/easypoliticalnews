import fs from 'fs-extra';
import path from 'path';
import { CompleteAnnotatedNews } from '../types';

const OUTPUT_DIR = path.join(__dirname, "../../../src/content/");

export function generateMarkdownPath(): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
    return path.join(OUTPUT_DIR, `news-${timestamp}.md`);
}

export async function writeMarkdownFile(analysis: CompleteAnnotatedNews): Promise<void> {
    const outputPath = generateMarkdownPath();
    const markdownContent = `---
news:
${analysis.news.map(article => `
  - headline: ${JSON.stringify(article.headline)}
    // ...rest of markdown generation...
`).join('\n')}
dateTime: ${JSON.stringify(analysis.dateTime)}
---`;

    await fs.writeFile(outputPath, markdownContent);
    console.log("Markdown file updated:", outputPath);
}
