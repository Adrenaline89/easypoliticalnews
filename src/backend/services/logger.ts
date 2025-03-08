import fs from 'fs-extra';
import path from 'path';

const LOG_DIR = '/tmp/news_agg.lo';
const LOG_FILE = path.join(LOG_DIR, 'log');

// Ensure log directory exists
fs.ensureDirSync(LOG_DIR);

function formatLogMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}\n`;
}

export const logger = {
    info: (message: string) => {
        fs.appendFileSync(LOG_FILE, formatLogMessage('INFO', message));
    },
    error: (message: string, error?: Error) => {
        const errorMessage = error ? 
            `${message}\n${error.message}\n${error.stack}` : 
            message;
        fs.appendFileSync(LOG_FILE, formatLogMessage('ERROR', errorMessage));
    },
    success: (message: string) => {
        fs.appendFileSync(LOG_FILE, formatLogMessage('SUCCESS', `✅ ${message}`));
    }
};
