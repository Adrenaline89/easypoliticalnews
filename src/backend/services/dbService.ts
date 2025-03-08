import Database from 'better-sqlite3';
import path from 'path';
import { NewsArticle, AnnotatedNews, CompleteAnnotatedNews } from '../types';

const dbPath = path.join(__dirname, "../../../../news.db");
const db = new Database(dbPath);

export function initializeDatabase(): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS headlines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            numberedTitle TEXT,
            authorByline TEXT,
            pubDate TEXT,
            url TEXT,
            publication TEXT DEFAULT 'Unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS annotated_news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numberedTitle TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS criteria_matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            annotated_news_id INTEGER,
            source TEXT NOT NULL,
            criteria TEXT NOT NULL,
            FOREIGN KEY(annotated_news_id) REFERENCES annotated_news(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS complete_annotated_news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER,
            criteria_matches_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(article_id) REFERENCES headlines(id),
            FOREIGN KEY(criteria_matches_id) REFERENCES criteria_matches(id)
        );

        PRAGMA foreign_keys = ON;
    `);
}

export async function saveHeadlines(articles: NewsArticle[]): Promise<void> {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO headlines 
        (title, numberedTitle, authorByline, pubDate, url, publication)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((articles: NewsArticle[]) => {
        for (const article of articles) {
            stmt.run(
                article.title,
                article.numberedTitle,
                article.authorByline,
                article.pubDate,
                article.url,
                article.publication || 'Unknown'
            );
        }
    });

    insertMany(articles);
}

export async function saveAnnotatedNews(analysis: AnnotatedNews): Promise<void> {
    const insertNewsStmt = db.prepare(
        `INSERT OR REPLACE INTO annotated_news (numberedTitle) VALUES (?)`
    );
    
    const insertMatchStmt = db.prepare(`
        INSERT OR REPLACE INTO criteria_matches 
        (annotated_news_id, source, criteria) 
        VALUES (?, ?, ?)
    `);

    const transaction = db.transaction((analysis: AnnotatedNews) => {
        for (const result of analysis.results) {
            const { lastInsertRowid } = insertNewsStmt.run(result.numberedTitle);
            
            for (const [source, criteria] of Object.entries(result.criteria_matches)) {
                for (const criterion of criteria) {
                    insertMatchStmt.run(lastInsertRowid, source, criterion);
                }
            }
        }
    });

    transaction(analysis);
}

export async function loadAnnotatedNews(): Promise<AnnotatedNews> {
    const results = db.prepare(`
        SELECT 
            an.numberedTitle,
            cm.source,
            cm.criteria
        FROM annotated_news an
        LEFT JOIN criteria_matches cm ON cm.annotated_news_id = an.id
        ORDER BY an.created_at DESC
    `).all();

    const groupedResults = results.reduce((acc, row) => {
        if (!acc[row.numberedTitle]) {
            acc[row.numberedTitle] = {
                numberedTitle: row.numberedTitle,
                criteria_matches: {}
            };
        }
        
        if (row.source && row.criteria) {
            if (!acc[row.numberedTitle].criteria_matches[row.source]) {
                acc[row.numberedTitle].criteria_matches[row.source] = [];
            }
            acc[row.numberedTitle].criteria_matches[row.source].push(row.criteria);
        }
        
        return acc;
    }, {});

    return {
        results: Object.values(groupedResults)
    };
}

export async function saveCompleteAnnotatedNews(analysis: CompleteAnnotatedNews): Promise<void> {
    const insertNewsStmt = db.prepare(`
        INSERT OR REPLACE INTO CompleteAnnotatedNews 
        (numberedTitle, title, authorByline, pubDate, url) 
        VALUES (?, ?, ?, ?, ?)
    `);
    
    // ...rest of saveCompleteAnnotatedNewsToDb function...
}

export async function loadCompleteAnnotatedNews(): Promise<CompleteAnnotatedNews> {
    const loadStmt = db.prepare(`
        SELECT 
            n.numberedTitle,
            n.title,
            n.authorByline,
            n.pubDate,
            n.url,
            m.category,
            m.match
        FROM CompleteAnnotatedNews n
        LEFT JOIN CompleteAnnotatedMatches m ON m.annotated_news_id = n.id
        ORDER BY n.created_at DESC
    `);

    // ...rest of loadCompleteAnnotatedNewsFromDb function...
}

// Move other database-related functions here...
