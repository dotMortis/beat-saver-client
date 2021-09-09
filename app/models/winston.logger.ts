import { app } from 'electron';
import { join } from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { args } from './args.model';

const consoleLogFormat = winston.format.printf(info => {
    return `[${new Date(info.timestamp).toLocaleString()}] [${info.level}] [${info.message}] [${
        info.data ? JSON.stringify(info.data, null, 2) : ''
    }]`;
});

export const logger = winston.createLogger({
    level: args.debug ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(winston.format.colorize(), consoleLogFormat)
        }),
        new DailyRotateFile({
            filename: join(app.getPath('appData'), app.getName(), 'logs', 'error.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error'
        }),
        new DailyRotateFile({
            filename: join(app.getPath('appData'), app.getName(), 'logs', 'combined.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});
