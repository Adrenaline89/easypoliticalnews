import sqlite3 from 'sqlite3';

interface Citation {
  step: string;
  links: string[];
}

interface CitationResult {
  citations: Citation[];
}

interface DbRow {
  step: string;
  relevant_link: string;
}

function generateCitationsJson(dbPath: string): Promise<CitationResult> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        return reject(`Failed to connect to the database: ${err.message}`);
      }
    });

    const query = `
      SELECT step, relevant_link
      FROM democracy_watch
      ORDER BY step
    `;

    const citationsMap: { [step: string]: Set<string> } = {};

    db.all(query, [], (err, rows: DbRow[]) => {
      if (err) {
        db.close();
        return reject(`Failed to execute query: ${err.message}`);
      }

      // Process rows and group links by step
      rows.forEach((row) => {
        if (!citationsMap[row.step]) {
          citationsMap[row.step] = new Set();
        }
        if (row.relevant_link !== 'N/A') {
          citationsMap[row.step].add(row.relevant_link);
        }
      });

      // Convert map to the desired JSON structure
      const citations: Citation[] = Object.keys(citationsMap).map((step) => ({
        step,
        links: Array.from(citationsMap[step]),
      }));

      db.close();
      resolve({ citations });
    });
  });
}

// Usage Example
(async () => {
  const dbPath = '../../citations.db'; // Replace with your SQLite DB path
  try {
    const result = await generateCitationsJson(dbPath);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
})();
