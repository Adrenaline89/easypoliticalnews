import axios from "axios";
import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "path";
import { config } from "dotenv";
import { OpenAI } from "openai";

config(); // Load environment variables

const PERIGON_API_KEY: string = process.env.PERIGON_API_KEY!;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
const OUTPUT_MARKDOWN_PATH: string = path.join(__dirname, "../../src/content/news.md");

// Initialize SQLite Database
const dbPath: string = path.join(__dirname, "../../../news.db");
const db: Database.Database = new Database(dbPath);

// Create a table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS headlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);


// Type Definitions
interface NewsArticle {
    title: string;
}

interface OpenAIResponse {
    choices: { message: { content: string } }[];
}

// Function to fetch news from Perigon.io
async function fetchNews(): Promise<string[]> {
    try {
        const response = await axios.get<{ articles: NewsArticle[] }>("https://api.goperigon.com/v1/all", {
            params: {
                apiKey: PERIGON_API_KEY,
                q: "technology",
                from: new Date().toISOString().split("T")[0],
                language: "en",
                page: 1,
                per_page: 3,
            },
        });

        const headlines: string[] = response.data.articles.map((article: NewsArticle) => article.title);
        console.log("Fetched headlines:", headlines);
        return headlines;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

// Save headlines to SQLite
async function saveHeadlinesToDb(headlines: string[]): Promise<void> {
    const insertStmt = db.prepare("INSERT OR IGNORE INTO headlines (title) VALUES (?)");

    const insertTransaction = db.transaction((titles: string[]) => {
        for (const title of titles) {
            insertStmt.run(title);
        }
    });

    insertTransaction(headlines);
}

// Load latest headlines from SQLite
async function loadHeadlinesFromDb(): Promise<string[]> {
    const stmt: Database.Statement = db.prepare("SELECT title FROM headlines ORDER BY created_at DESC LIMIT 3");
    const rows: { title: string }[] = stmt.all() as { title: string }[];
    return rows.map((row: { title: string }) => row.title);
}

// Sort headlines using OpenAI
async function sortHeadlinesWithAI(headlines: string[]): Promise<string[]> {
    const prompt: string = `Sort these headlines alphabetically:\n${headlines.join("\n")}`;
    const openai: OpenAI = new OpenAI({ apiKey: OPENAI_API_KEY });
    try {
        const response: OpenAIResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        const sortedText: string = response.choices[0]?.message?.content?.trim() || "";
        return sortedText.split("\n").map((h: string) => h.trim()).filter(Boolean);
    } catch (error) {
        console.error("Error sorting headlines with OpenAI:", error);
        return [];
    }
}

// Write sorted headlines to a Markdown file for Astro
async function writeMarkdownFile(headlines: string[]): Promise<void> {
    const markdownContent: string = `---
title: "Latest News"
date: "${new Date().toISOString()}"
---

# Sorted News Headlines

${headlines.map((headline: string) => `- ${headline}`).join("\n")}

---

_Last updated on ${new Date().toLocaleString()}_
`;

    await fs.writeFile(OUTPUT_MARKDOWN_PATH, markdownContent);
    console.log("Markdown file updated:", OUTPUT_MARKDOWN_PATH);
}

// Main execution function
async function main(): Promise<void> {
    console.log("Fetching latest news...");
    const headlines: string[] = await fetchNews();

    if (headlines.length === 0) {
        console.error("No headlines fetched. Exiting.");
        return;
    }

    console.log("Saving headlines to database...");
    await saveHeadlinesToDb(headlines);

    //console.log("Loading latest headlines from database...");
    //const storedHeadlines: string[] = await loadHeadlinesFromDb();

    //console.log("Sorting headlines with OpenAI...");
    //const sortedHeadlines: string[] = await sortHeadlinesWithAI(storedHeadlines);

    //console.log("Writing sorted headlines to Markdown...");
    //await writeMarkdownFile(sortedHeadlines);
}

main().catch(console.error);