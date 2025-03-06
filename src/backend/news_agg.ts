import axios from "axios";
import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "path";
import { config } from "dotenv";
import { OpenAI } from "openai";
import snoowrap from 'snoowrap';

config(); // Load environment variables

const PERIGON_API_KEY: string = process.env.PERIGON_API_KEY!;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
const OUTPUT_MARKDOWN_DIR: string = path.join(__dirname, "../../src/content/");

const POLITICAL_KEYWORDS = [
    'taxes', 'congress', 'senate', 'white house', 'senator', 'congressman', 
    'congresswoman', 'representative', 'Democrat', 'republican', 'federal', 
    'judge', 'FAA', 'cdc', 'fbi', 'doj', 'DOGE', 'VA', 'veteran', 'Judge', 
    'Constitution', 'supreme court', 'musk', 'Trump', 'us military', 
    'deportation', 'ICE', 'right wing', 'Nazi', 'purge', 'Bernie', 
    'andreessen', 'yarvin', 'thief', 'PayPal mafia', 'attorney general', 
    'cabinet', 'inspector general', 'IG', 'AG', 'project 2025'
];

const myPrompt: string = `i will give a list of criteria from 3 main sources: 7 steps from democracy to dictator, lessons from nazis rusing o power, and dictatos hanbook. here's the criteria:

## 7 signs
To prevent the dismantling of democracy, news consumers, journalists, and policymakers should watch for key warning signs based on Ece Temelkuran's **7 steps from democracy to dictatorship**. These serve as **criteria for news to monitor** in order to safeguard democratic institutions:

### **1. Rise of Populist Movements**

- Watch for news on political figures or movements claiming to be the sole voice of "the people" while demonizing opposition.
- Be wary of leaders promoting **us vs. them** narratives.

### **2. Attacks on Rational Debate & Truth**

- Monitor disinformation campaigns, **attacks on the free press**, and the spread of conspiracy theories.
- Look for efforts to **delegitimize journalists, scientists, and experts**.

### **3. Erosion of Political Ethics**

- Identify corruption scandals that are **downplayed or normalized**.
- Be cautious of **political leaders disregarding accountability** or refusing to uphold traditional democratic norms.

### **4. Undermining of Democratic Institutions**

- Watch for **attacks on independent courts, election commissions, and watchdog organizations**.
- Look for leaders stacking institutions with **loyalists instead of qualified professionals**.

### **5. Redefinition of Citizenship & Suppression of Dissent**

- Be alert to news about **new laws restricting voting rights**, freedom of speech, or **increased targeting of minorities**.
- Follow attempts to **demonize activists, opposition groups, or marginalized communities**.

### **6. Breakdown of the Rule of Law**

- Investigate **news on leaders ignoring legal checks and balances**.
- Watch for the use of the **police, military, or courts to suppress opposition**.

### **7. Moves Toward One-Party Rule & Power Consolidation**

- Look for **efforts to silence or disband opposition parties**.
- Follow reports on **election manipulation, indefinite rule extensions, or constitutional changes benefiting a leader**.

## Nazis
To prevent the dismantling of democracy and the rise of authoritarian rule, news consumers, journalists, and policymakers should be vigilant for **early warning signs** based on the steps the Nazis took to seize power. These serve as **criteria for news to monitor** in order to safeguard democratic institutions.

---

### **1. Exploiting Economic & Social Turmoil**

- **Watch for leaders blaming economic hardships on specific groups** (e.g., immigrants, minorities, political opponents) rather than proposing real solutions.
- **Monitor attempts to discredit democratic governance**, portraying it as weak, corrupt, or incapable of solving national crises.

### **2. Attempts to Overthrow or Undermine Democratic Institutions**

- **Be alert to violent or unconstitutional attempts to seize power**, such as coups, election subversions, or illegal detentions of political opponents.
- **Follow paramilitary or extremist groups** that advocate for political violence or seek to undermine state authority.

### **3. Manipulation of Public Opinion Through Propaganda**

- **Identify coordinated disinformation campaigns** aimed at rewriting history, distorting facts, or demonizing opponents.
- **Watch for political leaders centralizing media control**, suppressing independent journalism, or spreading state-sponsored narratives.

### **4. Gradual Erosion of Civil Liberties & Legal Frameworks**

- **Monitor laws restricting freedom of speech, press, protest, or political organization**.
- **Be cautious of “emergency measures” that suspend democratic rights**, often justified by security concerns.
- **Pay attention to crackdowns on unions, opposition parties, and activists**, as these often precede authoritarian consolidation.

### **5. Rise of One-Party Rule & Elimination of Political Opponents**

- **Watch for efforts to weaken or dismantle political opposition**, including harassment, arrests, or disqualifications of candidates.
- **Be aware of attempts to manipulate elections**, such as voter suppression, intimidation, or constitutional changes to extend a leader’s rule.

### **6. Use of Violence, Intimidation, and Fear**

- **Follow incidents of political violence**, including attacks on opposition figures, journalists, or marginalized groups.
- **Pay attention to the militarization of politics**, such as political leaders using armed groups or law enforcement to suppress dissent.

### **7. Consolidation of Absolute Power**

- **Be vigilant of leaders merging government branches**, abolishing term limits, or declaring themselves rulers beyond constitutional limits.
- **Monitor attempts to rewrite national identity** to fit a leader’s ideology, often by promoting extreme nationalism or scapegoating minorities.

## Dictator's Handbook
To prevent the **dismantling of democracy**, news consumers, journalists, and policymakers should watch for **warning signs** based on insights from _The Dictator’s Handbook_. These serve as **criteria for news to monitor**, helping safeguard democratic institutions by identifying when leaders manipulate power for self-interest.

---

### **1. Leaders Prioritizing Power Over Public Welfare**

- **Watch for leaders prioritizing personal survival over national interests**, such as making policies that only benefit their inner circle.
- **Be alert to leaders undermining democratic processes** (e.g., postponing elections, ignoring court rulings, or consolidating executive power).

### **2. Shrinking the Ruling Coalition to Stay in Power**

- **Monitor voter suppression efforts**, such as restrictive voting laws, gerrymandering, or limiting political opposition.
- **Follow reports on media takeovers**, censorship, or government influence over the judiciary, which reduce democratic checks.

### **3. Increased Corruption and Patronage**

- **Be cautious of government contracts, appointments, or funding being directed to loyalists instead of being merit-based**.
- **Track money trails**—watch for suspicious wealth accumulation among government insiders, misuse of foreign aid, or unaccounted state funds.

### **4. Attacks on Democratic Institutions and the Free Press**

- **Follow efforts to weaken institutions** like election commissions, courts, or anti-corruption agencies.
- **Watch for increasing media censorship**, journalist arrests, and state-controlled narratives dominating public discourse.

### **5. Economic Growth Benefiting Only the Ruling Class**

- **Scrutinize economic policies that concentrate wealth among political elites while ordinary citizens struggle**.
- **Monitor international aid distribution**—is it being used for national development, or is it propping up a corrupt regime?

### **6. Political Opponents and Critics Being Targeted**

- **Look for signs of increasing political repression**, including arrests, surveillance, and harassment of opposition leaders or activists.
- **Pay attention to laws being passed to criminalize dissent**, such as labeling opposition groups as "terrorists" or banning protests.

### **7. Signs of Elites Turning Against the Leader**

- **Observe defections from key allies**—when major politicians, military leaders, or business elites start distancing themselves from the ruling party.
- **Be aware of mass resignations or scandals** that suggest internal conflicts within the government.

now, i will give you numbered headlines. i want you to match (if possible) the headline with as many relevant criteria from above.  
I want you generate valid json that looks like this:

{ 
 "results":
 [
   { 
    "numberedTitle": [foo],
     "criteria_matches": 
     [ 
       {"7 signs": [bar]}
     ]
   },
   { 
    "numberedTitle": [bar],
     "criteria_matches": 
     [ 
       {"nazis": [bar]},
       {"nazis": [foo]}
     ]
   },
      { 
    "numberedTitle": [bar],
    "criteria_matches": [ ]
   },
 
 ]


here  are the headlines. make sure not to remove the numbers:
 1. Trump's address to Congress
1. Congress MLC Teenmaar Mallanna says Revanth Reddy weakening Congress to benefit BJP
2. Trump's full address to Congress
3. FactChecking Trump's Address to Congress
4. Trump’s annual address to Congress
5. President Trump's address to Congress
6. Bloomberg Daybreak: Trump Addresses Congress
7. EDITORIAL: Congress, stop the purge
8. Congress reacts to Trump's speech
9. Exclusive: Trump Administration Suspends Military Deportation Flights - Video API
10. Undocumented woman shares mass deportation fears under Trump policy
11. UK Refuses to Pay Rwanda for Scrapped Deportation Deal
12. Trump administration halts deportation flights with military aircraft: Report
13. ‘It’s heartbreaking': Mass. Rep. Pressley shares constituents’ deportation fears
14. Chris Bianco says Trump's mass deportation threats are already hurting restaurants
15. Our deportation and immigration coverage: Everything you need to know in North Jersey
16. Evaluating President Trump's Deportation Policies: Actions, Impacts, and Reactions - Lake County Florida News
`

// Initialize SQLite Database and create all tables at startup
const dbPath: string = path.join(__dirname, "../../../news.db");
const db: Database.Database = new Database(dbPath);

// Create all tables in correct order with proper foreign key relationships
db.exec(`
    -- Base tables
    CREATE TABLE IF NOT EXISTS headlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT UNIQUE,
        numberedTitle TEXT,
        authorByline TEXT,
        pubDate TEXT,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);
/*
// Add Reddit configuration
const reddit = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
});
*/


// Modify database schema to include Reddit posts
db.exec(`
    CREATE TABLE IF NOT EXISTS reddit_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT UNIQUE,
        author TEXT,
        created_utc INTEGER,
        url TEXT,
        permalink TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AnnotatedNews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numberedTitle TEXT UNIQUE,
        criteria_matches TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// Update database schema for AnnotatedNews
db.exec(`
    CREATE TABLE IF NOT EXISTS AnnotatedNews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numberedTitle TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CriteriaMatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        annotated_news_id INTEGER,
        category TEXT,
        match TEXT,
        FOREIGN KEY(annotated_news_id) REFERENCES AnnotatedNews(id) ON DELETE CASCADE,
        UNIQUE(annotated_news_id, category, match)
    );

    CREATE TABLE IF NOT EXISTS CompleteAnnotatedNews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numberedTitle TEXT UNIQUE,
        title TEXT,
        authorByline TEXT,
        pubDate TEXT,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CompleteAnnotatedMatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        annotated_news_id INTEGER,
        category TEXT,
        match TEXT,
        FOREIGN KEY(annotated_news_id) REFERENCES CompleteAnnotatedNews(id) ON DELETE CASCADE,
        UNIQUE(annotated_news_id, category, match)
    );

    -- Enable foreign key support
    PRAGMA foreign_keys = ON;
`);

// Simple database functions
async function saveAnnotatedNewsToDb(analysis: AnnotatedNews): Promise<void> {
    const insertNewsStmt = db.prepare(
        "INSERT OR REPLACE INTO AnnotatedNews (numberedTitle) VALUES (?)"
    );
    
    const deleteOldMatchesStmt = db.prepare(
        "DELETE FROM CriteriaMatches WHERE annotated_news_id = ?"
    );
    
    const insertMatchStmt = db.prepare(
        "INSERT OR IGNORE INTO CriteriaMatches (annotated_news_id, category, match) VALUES (?, ?, ?)"
    );

    const insertTransaction = db.transaction((results: typeof analysis.results) => {
        for (const result of results) {
            // Insert or update the news entry
            const newsInfo = insertNewsStmt.run(result.numberedTitle);
            const newsId = newsInfo.lastInsertRowid;

            // Clean up old matches first
            deleteOldMatchesStmt.run(newsId);

            // Insert new matches
            Object.entries(result.criteria_matches).forEach(([category, matches]) => {
                matches.forEach(match => {
                    insertMatchStmt.run(newsId, category, match);
                });
            });
        }
    });

    try {
        insertTransaction(analysis.results);
        console.log(`Saved ${analysis.results.length} annotated headlines to database`);
    } catch (error) {
        console.error("Error saving annotated news:", error);
    }
}

// Add new save function for CompleteAnnotatedNews
async function saveCompleteAnnotatedNewsToDb(analysis: CompleteAnnotatedNews): Promise<void> {
    const insertNewsStmt = db.prepare(`
        INSERT OR REPLACE INTO CompleteAnnotatedNews 
        (numberedTitle, title, authorByline, pubDate, url) 
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const insertMatchStmt = db.prepare(`
        INSERT OR IGNORE INTO CompleteAnnotatedMatches 
        (annotated_news_id, category, match) 
        VALUES (?, ?, ?)
    `);

    const insertTransaction = db.transaction((results: typeof analysis.results) => {
        for (const result of results) {
            // Insert the complete news entry
            const newsInfo = insertNewsStmt.run(
                result.numberedTitle,
                result.title,
                result.authorByline,
                result.pubDate,
                result.url
            );
            const newsId = newsInfo.lastInsertRowid;

            // Insert all matches for this news entry
            Object.entries(result.criteria_matches).forEach(([category, matches]) => {
                matches.forEach(match => {
                    insertMatchStmt.run(newsId, category, match);
                });
            });
        }
    });

    try {
        insertTransaction(analysis.results);
        console.log(`Saved ${analysis.results.length} complete annotated headlines to database`);
    } catch (error) {
        console.error("Error saving complete annotated news:", error);
    }
}

// Add function to load complete annotated news
async function loadCompleteAnnotatedNewsFromDb(): Promise<CompleteAnnotatedNews> {
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

    try {
        const rows = loadStmt.all();
        
        // Group the rows by numberedTitle
        const groupedResults = rows.reduce((acc, row) => {
            if (!acc[row.numberedTitle]) {
                acc[row.numberedTitle] = {
                    numberedTitle: row.numberedTitle,
                    title: row.title,
                    authorByline: row.authorByline,
                    pubDate: row.pubDate,
                    url: row.url,
                    criteria_matches: {}
                };
            }
            
            if (row.category && row.match) {
                if (!acc[row.numberedTitle].criteria_matches[row.category]) {
                    acc[row.numberedTitle].criteria_matches[row.category] = [];
                }
                acc[row.numberedTitle].criteria_matches[row.category].push(row.match);
            }
            
            return acc;
        }, {} as Record<string, CompleteAnnotatedNews['results'][0]>);

        return {
            results: Object.values(groupedResults)
        };
    } catch (error) {
        console.error("Error loading complete annotated news:", error);
        return { results: [] };
    }
}

// Type Definitions
interface NewsArticle {
    title: string;
    numberedTitle: string;  // Add this new property
    authorByline: string;
    pubDate: string;
    url: string;
}

interface OpenAIResponse {
    choices: { message: { content: string } }[];
}

interface AnnotatedNews {
    results: {
      numberedTitle: string;
      criteria_matches: {
        [key: string]: string[];
      };
    }[];
  }
  

// Add Reddit post interface
interface RedditPost {
    title: string;
    author: string;
    created_utc: number;
    url: string;
    permalink: string;
}

// Add new interface for complete annotated news
interface CompleteAnnotatedNews {
    results: {
        numberedTitle: string;
        title: string;
        authorByline: string;
        pubDate: string;
        url: string;
        criteria_matches: {
            [key: string]: string[];
        };
    }[];
}

// Function to fetch news from Perigon.io
async function fetchNews(): Promise<NewsArticle[]> {
    try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Create multiple promises for parallel requests
        const promises = POLITICAL_KEYWORDS.map(keyword =>
            axios.get<{ articles: NewsArticle[] }>("https://api.goperigon.com/v1/all", {
                params: {
                    apiKey: PERIGON_API_KEY,
                    q: keyword,
                    from: today.toISOString(), // Use today's date starting at midnight
                    language: "en",
                    page: 1,
                    per_page: 3,
                }
            })
        );

        // Execute all requests in parallel
        const responses = await Promise.allSettled(promises);

        // Filter successful responses and flatten the articles array
        const allArticles = responses
            .filter((response): response is PromiseFulfilledResult<any> => response.status === 'fulfilled')
            .flatMap(response => response.value.data.articles)
            .map(({ title, authorByline, pubDate, url }, index) => ({
                title,
                numberedTitle: `${index + 1}. ${title}`,  // Add numbered title
                authorByline,
                pubDate,
                url
            }));

        // Remove duplicates based on title
        const uniqueArticles = Array.from(
            new Map(allArticles.map(article => [article.title, article])).values()
        );

        console.log(`Fetched ${uniqueArticles.length} unique articles`);
        return uniqueArticles;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}
/*
// Function to fetch Reddit posts
async function fetchRedditPosts(): Promise<RedditPost[]> {
    try {
        const subreddit = await reddit.getSubreddit('politics');
        const topPosts = await subreddit.getTop({time: 'day', limit: 25});
        
        const posts = topPosts.map(post => ({
            title: post.title,
            author: post.author.name,
            created_utc: post.created_utc,
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`
        }));

        console.log("Fetched Reddit posts:", posts);
        return posts;
    } catch (error) {
        console.error("Error fetching Reddit posts:", error);
        return [];
    }
}
*/

// Save headlines to SQLite
async function saveHeadlinesToDb(articles: NewsArticle[]): Promise<void> {
    const insertStmt = db.prepare(
        "INSERT OR IGNORE INTO headlines (title, numberedTitle, authorByline, pubDate, url) VALUES (?, ?, ?, ?, ?)"
    );

    const insertTransaction = db.transaction((articles: NewsArticle[]) => {
        for (const article of articles) {
            insertStmt.run(
                article.title,
                article.numberedTitle,
                article.authorByline,
                article.pubDate,
                article.url
            );
        }
    });

    try {
        insertTransaction(articles);
        console.log(`Saved ${articles.length} headlines to database`);
    } catch (error) {
        console.error("Error saving headlines:", error);
    }
}

// Save Reddit posts to SQLite
async function saveRedditPostsToDb(posts: RedditPost[]): Promise<void> {
    const insertStmt = db.prepare(
        "INSERT OR IGNORE INTO reddit_posts (title, author, created_utc, url, permalink) VALUES (?, ?, ?, ?, ?)"
    );

    const insertTransaction = db.transaction((posts: RedditPost[]) => {
        for (const post of posts) {
            insertStmt.run(post.title, post.author, post.created_utc, post.url, post.permalink);
        }
    });

    try {
        insertTransaction(posts);
        console.log(`Saved ${posts.length} Reddit posts to database`);
    } catch (error) {
        console.error("Error saving Reddit posts:", error);
    }
}

// Load latest headlines from SQLite
async function loadHeadlinesFromDb(): Promise<NewsArticle[]> {
    const loadStmt = db.prepare(
        "SELECT title, numberedTitle, authorByline, pubDate, url FROM headlines ORDER BY created_at DESC LIMIT 3"
    );

    try {
        return loadStmt.all() as NewsArticle[];
    } catch (error) {
        console.error("Error loading headlines:", error);
        return [];
    }
}

// Sort headlines using OpenAI
async function sortHeadlinesWithAI(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const prompt: string = `Sort these headlines alphabetically:\n${articles.map(article => article.title).join("\n")}`;
    const openai: OpenAI = new OpenAI({ apiKey: OPENAI_API_KEY });
    try {
        const response: OpenAIResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        const sortedTitles: string[] = response.choices[0]?.message?.content?.trim().split("\n").map((h: string) => h.trim()).filter(Boolean) || [];
        return sortedTitles.map(title => articles.find(article => article.title === title)!);
    } catch (error) {
        console.error("Error sorting headlines with OpenAI:", error);
        return [];
    }
}

// Replace the static OUTPUT_MARKDOWN_PATH with a function
const getMarkdownPath = () => {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0]; // Format: YYYY-MM-DD_HH-mm-ss
    return path.join(__dirname, OUTPUT_MARKDOWN_DIR, `news-${timestamp}.md`);
};

// Write sorted headlines to a Markdown file for Astro
async function writeMarkdownFile(analysis: CompleteAnnotatedNews): Promise<void> {
    const outputPath = getMarkdownPath();
    const markdownContent: string = `---
title: "Political News Analysis"
date: "${new Date().toISOString()}"
filename: "${path.basename(outputPath)}"
---

# Political News Analysis Report

## Summary
Total headlines analyzed: ${analysis.results.length}
Analysis timestamp: ${new Date().toLocaleString()}

## Headlines Analysis

${analysis.results.map((result) => `
### ${result.numberedTitle}
**Source:** ${result.authorByline || 'Unknown'}
**Date:** ${result.pubDate || 'Unknown'}
**URL:** ${result.url || 'Not available'}

${Object.entries(result.criteria_matches)
    .filter(([_, matches]) => matches.length > 0)
    .map(([category, matches]) => `
#### ${category}
${matches.map(match => `- ${match}`).join('\n')}

**Match count:** ${matches.length}
`).join('\n')}

${Object.keys(result.criteria_matches).length === 0 ? 
    '**No criteria matches found for this headline**' : 
    `**Total matches:** ${Object.values(result.criteria_matches)
        .reduce((sum, matches) => sum + matches.length, 0)}`}
---`).join('\n\n')}

## Analysis Statistics
${(() => {
    const stats = analysis.results.reduce((acc, result) => {
        Object.entries(result.criteria_matches).forEach(([category, matches]) => {
            acc[category] = (acc[category] || 0) + matches.length;
        });
        return acc;
    }, {} as Record<string, number>);

    return `
### Matches by Category
${Object.entries(stats)
    .sort(([_, a], [__, b]) => b - a)
    .map(([category, count]) => `- ${category}: ${count} matches`)
    .join('\n')}
`})()}

---

_Generated on ${new Date().toLocaleString()}_
_Database ID range: ${analysis.results[0]?.numberedTitle.split('.')[0]} - ${analysis.results[analysis.results.length - 1]?.numberedTitle.split('.')[0]}_
`;

    await fs.writeFile(outputPath, markdownContent);
    console.log("Markdown file updated:", outputPath);
}

// Create numbered titles string
function createNumberedTitlesString(articles: NewsArticle[]): string {
    return articles
        .map((article, index) => `${index + 1}. ${article.title}`)
        .join('\n');
}

async function sendPromptAndHeadlinesToChatGPT(headlines: string, prompt: string): Promise<AnnotatedNews> {
    const openai: OpenAI = new OpenAI({ apiKey: OPENAI_API_KEY });
    
    try {

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "user", content: prompt+headlines }
            ],
            temperature: 0,
            
        });

        const parsedResponse = JSON.parse(response.choices[0]?.message?.content || "{}") as AnnotatedNews;
        //const parsedResponse : string = response.choices[0]?.message?.content || "{}";
        if (!parsedResponse.results) {
            throw new Error("Invalid response format from GPT");
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error processing headlines with ChatGPT:", error);
        // Return empty but valid AnnotatedNews structure
        return {
            results: []
        };
        //return ":("
    }
}

// Function to sort AnnotatedNews by criteria matches
function sortAnnotatedNewsByMatches(news: AnnotatedNews): AnnotatedNews {
    return {
        results: [...news.results].sort((a, b) => {
            // Calculate total matches for each result
            const getTotalMatches = (result: typeof a) => 
                Object.values(result.criteria_matches)
                    .reduce((sum, matches) => sum + matches.length, 0);

            // Calculate unique matches (removing duplicates)
            const getUniqueMatches = (result: typeof a) => 
                new Set(
                    Object.values(result.criteria_matches)
                        .flat()
                ).size;

            const aTotalMatches = getTotalMatches(a);
            const bTotalMatches = getTotalMatches(b);
            const aUniqueMatches = getUniqueMatches(a);
            const bUniqueMatches = getUniqueMatches(b);

            // Sort by total matches first, then by unique matches
            if (aTotalMatches !== bTotalMatches) {
                return bTotalMatches - aTotalMatches; // Higher total first
            }
            return bUniqueMatches - aUniqueMatches; // Higher unique count first
        })
    };
}

async function loadAnnotatedNewsFromDb(): Promise<AnnotatedNews> {
    const loadStmt = db.prepare(`
        SELECT 
            a.numberedTitle,
            c.category,
            c.match
        FROM AnnotatedNews a
        LEFT JOIN CriteriaMatches c ON c.annotated_news_id = a.id
        ORDER BY a.created_at DESC
    `);

    try {
        const rows = loadStmt.all();
        
        // Group the rows by numberedTitle
        const groupedResults = rows.reduce((acc, row) => {
            if (!acc[row.numberedTitle]) {
                acc[row.numberedTitle] = {
                    numberedTitle: row.numberedTitle,
                    criteria_matches: {}
                };
            }
            
            if (row.category && row.match) {
                if (!acc[row.numberedTitle].criteria_matches[row.category]) {
                    acc[row.numberedTitle].criteria_matches[row.category] = [];
                }
                acc[row.numberedTitle].criteria_matches[row.category].push(row.match);
            }
            
            return acc;
        }, {} as Record<string, {
            numberedTitle: string;
            criteria_matches: {
                [key: string]: string[];
            };
        }>);

        return {
            results: Object.values(groupedResults)
        };
    } catch (error) {
        console.error("Error loading annotated news:", error);
        return { results: [] };
    }
}

// Add function to merge articles with their analysis
function mergeArticlesWithAnalysis(
    articles: NewsArticle[], 
    analysis: AnnotatedNews
): CompleteAnnotatedNews {
    const mergedResults = analysis.results
        .filter(analysisItem => analysisItem.numberedTitle && analysisItem.numberedTitle.trim() !== '')
        .map(analysisItem => {
            // Find matching article by comparing titles
            const articleTitle = analysisItem.numberedTitle.substring(
                analysisItem.numberedTitle.indexOf('.') + 2
            );
            const matchingArticle = articles.find(article => article.title === articleTitle);

            if (!matchingArticle) {
                // If no matching article found, return just the analysis data
                return {
                    ...analysisItem,
                    title: articleTitle,
                    authorByline: 'Unknown',
                    pubDate: '',
                    url: ''
                };
            }

            // Merge article data with analysis
            return {
                ...analysisItem,
                title: matchingArticle.title,
                authorByline: matchingArticle.authorByline,
                pubDate: matchingArticle.pubDate,
                url: matchingArticle.url
            };
        });

    return { results: mergedResults };
}

// Main execution function
async function main(): Promise<void> {
    try {
        console.log("Fetching latest news...");
        const articles: NewsArticle[] = await fetchNews();
        
        //console.log("Fetching Reddit posts...");
        //const redditPosts: RedditPost[] = await fetchRedditPosts();
    
        //if (articles.length === 0 && redditPosts.length === 0) {
        //      console.error("No content fetched. Exiting.");
        //    return;
        //}
    
        console.log("Saving articles to database...");
        await saveHeadlinesToDb(articles);
    
        //console.log("Saving Reddit posts to database...");
        //await saveRedditPostsToDb(redditPosts);
    
        //console.log("Loading latest articles from database...");
        //const storedArticles: NewsArticle[] = await loadHeadlinesFromDb();
        
        // const numberedTitlesString = createNumberedTitlesString(storedArticles);
        // console.log("Numbered Titles:\n", numberedTitlesString);
    
        // const analysis = await sendPromptAndHeadlinesToChatGPT(
        //    numberedTitlesString,
        //    myPrompt
        // ;
        
        // const sortedAnalysis = sortAnnotatedNewsByMatches(analysis);
        // const completeAnalysis = mergeArticlesWithAnalysis(storedArticles, sortedAnalysis);
        // console.log("Complete Analysis:", JSON.stringify(completeAnalysis, null, 2));
        
        // console.log("Saving complete analysis to database...");
        // await saveCompleteAnnotatedNewsToDb(completeAnalysis);
    
        //console.log("Writing sorted analysis to Markdown...");
        //await writeMarkdownFile(completeAnalysis);
        
        /*
        console.log("Loading previous analysis from database...");
        const previousAnalysis = await loadAnnotatedNewsFromDb();
        console.log("Previous Analysis:", JSON.stringify(previousAnalysis, null, 2));
        
        console.log("Sorting articles with OpenAI...");
        const sortedArticles: NewsArticle[] = await sortHeadlinesWithAI(storedArticles);
    
        console.log("Writing sorted articles to Markdown...");
        await writeMarkdownFile(sortedArticles);
        */
    } catch (error) {
        console.error(error);
    }
}

main().catch(console.error);