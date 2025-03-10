import fs from 'fs-extra';
import path from 'path';

const LOG_DIR = '/tmp/';
const LOG_FILE = path.join(LOG_DIR, 'news_agg.log');
const JSON_LOG_FILE = path.join(LOG_DIR, 'news_agg.json.log');

// Ensure log directory exists
fs.ensureDirSync(LOG_DIR);

function formatLogMessage(level: string, message: string): string {
    const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return `[${timestamp} PT] ${level}: ${message}\n`;
}

interface LogEntry {
    timestamp: string;
    function: string;
    event: 'before' | 'after';
    variable: {
        name: string;
        type: string;
        data: any;
    };
}

export async function logJson(
    functionName: string,
    eventType: 'before' | 'after',
    variableName: string,
    variableType: string,
    data: any
): Promise<void> {
    const entry: LogEntry = {
        timestamp: new Date().toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }),
        function: functionName,
        event: eventType,
        variable: {
            name: variableName,
            type: variableType,
            data
        }
    };
    
    await fs.appendFile(JSON_LOG_FILE, JSON.stringify(entry, null, 2) + '\n');
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
