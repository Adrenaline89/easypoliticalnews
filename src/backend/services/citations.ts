import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Citation, CitationStep, CitationRow } from '../types';

// Export the interface for use in other files
export interface SimpleCitationResult {
    citations: {
        step: string;
        links: string[];
    }[];
}

export async function initCitationsDb(dbPath: string): Promise<void> {
    const db = new sqlite3.Database(dbPath);
    const run = promisify(db.run.bind(db));

    try {
        await run(`
            CREATE TABLE IF NOT EXISTS citations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                author TEXT,
                step TEXT NOT NULL,
                link TEXT NOT NULL,
                pub_date TEXT,
                source_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        throw new Error(`Failed to initialize database: ${error}`);
    } finally {
        db.close();
    }
}

export const DICTATOR_HANDBOOK_CITATIONS: Citation[] = [
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.PowerOverWelfare,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/power-over-public-welfare"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.ShrinkingCoalition,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/shrinking-coalition"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.CorruptionPatronage,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/corruption-and-patronage"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.AttacksOnPress,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/attacks-on-institutions"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.EconomicInequality,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/economic-inequality"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.TargetingOpponents,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/targeting-opposition"],
        pubDate: "2011",
        sourceType: 'dictator'
    },
    {
        source: "Dictator's Handbook",
        author: "Bruce Bueno de Mesquita and Alastair Smith",
        step: CitationStep.ElitesTurning,
        links: ["https://www.cambridge.org/core/books/dictators-handbook/elite-defection"],
        pubDate: "2011",
        sourceType: 'dictator'
    }
];

export const NAZI_RISE_CITATIONS: Citation[] = [
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.CreateCrisis,
        links: ["https://encyclopedia.ushmm.org/content/en/article/reichstag-fire-decree"],
        pubDate: "1933-02-27",
        sourceType: 'nazi'
    },
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.DemonizeOpponents,
        links: ["https://encyclopedia.ushmm.org/content/en/article/nazi-propaganda"],
        pubDate: "1933-01-30",
        sourceType: 'nazi'
    },
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.DeclareEmergency,
        links: ["https://encyclopedia.ushmm.org/content/en/article/reichstag-fire-decree"],
        pubDate: "1933-02-28",
        sourceType: 'nazi'
    },
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.UndermineElections,
        links: ["https://encyclopedia.ushmm.org/content/en/article/the-enabling-act"],
        pubDate: "1933-03-23",
        sourceType: 'nazi'
    },
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.MakeLawIrrelevant,
        links: ["https://encyclopedia.ushmm.org/content/en/article/the-enabling-act"],
        pubDate: "1933-03-23",
        sourceType: 'nazi'
    },
    {
        source: "USHMM",
        author: "United States Holocaust Memorial Museum",
        step: CitationStep.RuleByDecree,
        links: ["https://encyclopedia.ushmm.org/content/en/article/the-enabling-act"],
        pubDate: "1933-03-24",
        sourceType: 'nazi'
    }
];

export const DEMOCRACY_STEPS_CITATIONS: Citation[] = [
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.RiseOfPopulist,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/rise-of-populism"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.AttacksOnDebate,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/attacks-on-debate"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.ErosionOfEthics,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/erosion-ethics"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.UnderminingInstitutions,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/undermining-institutions"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.RedefiningCitizenship,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/redefining-citizenship"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.BreakdownOfLaw,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/breakdown-of-law"],
        pubDate: "2019",
        sourceType: 'democracy'
    },
    {
        source: "Seven Steps from Democracy to Dictatorship",
        author: "Ece Temelkuran",
        step: CitationStep.OnePowerRule,
        links: ["https://www.cambridge.org/core/books/how-to-lose-a-country/one-party-rule"],
        pubDate: "2019",
        sourceType: 'democracy'
    }
];

export const ALL_CITATIONS = [
    ...DICTATOR_HANDBOOK_CITATIONS,
    ...NAZI_RISE_CITATIONS,
    ...DEMOCRACY_STEPS_CITATIONS
];

export async function insertCitations(dbPath: string, citations: Citation[]): Promise<void> {
    const db = new sqlite3.Database(dbPath);
    const run = promisify(db.run.bind(db));

    try {
        for (const citation of citations) {
            for (const link of citation.links) {
                await run(
                    `INSERT INTO citations (source, author, step, link, pub_date, source_type)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [citation.source, citation.author, citation.step, link, citation.pubDate || '', citation.sourceType]
                );
            }
        }
    } catch (error) {
        throw new Error(`Failed to insert citations: ${error}`); 
    } finally {
        db.close();
    }
}

export async function getCitationsByType(dbPath: string, sourceType: Citation['sourceType']): Promise<Citation[]> {
    const db = new sqlite3.Database(dbPath);
    const all = promisify(db.all.bind(db));

    try {
        const rows = await all(
            `SELECT source, author, step, link, pub_date, source_type 
             FROM citations 
             WHERE source_type = ?`,
            [sourceType]
        );
        return rows.map(row => ({
            source: row.source,
            author: row.author,
            step: row.step,
            links: [row.link],
            pubDate: row.pub_date,
            sourceType: row.source_type
        }));
    } catch (error) {
        throw new Error(`Failed to fetch citations: ${error}`);
    } finally {
        db.close();
    }
}

export async function generateCitationsJson(dbPath: string): Promise<SimpleCitationResult> {
    const db = new sqlite3.Database(dbPath);
    const all = promisify(db.all.bind(db));

    try {
        const rows = await all(
            `SELECT step, link FROM citations ORDER BY step`
        ) as CitationRow[];

        // Group links by step
        const citationMap = rows.reduce((acc, row) => {
            if (!acc[row.step]) {
                acc[row.step] = new Set<string>();
            }
            acc[row.step].add(row.link);
            return acc;
        }, {} as Record<string, Set<string>>);

        // Convert to desired format
        const citations = Object.entries(citationMap).map(([step, links]) => ({
            step,
            links: Array.from(links)
        }));

        return { citations };
    } catch (error) {
        throw new Error(`Failed to generate citations JSON: ${error}`);
    } finally {
        db.close();
    }
}
