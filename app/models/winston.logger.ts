import { app } from 'electron';
import { join } from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { args } from './args.model';

const consoleLogFormat = winston.format.printf(info => {
    const ts = new Date(info.metadata.timestamp)?.toLocaleString();
    delete info.metadata.timestamp;
    return `[${ts}] [${info.level}] [${info.message}] [${
        info.metadata ? JSON.stringify(info.metadata, null, 2) : ''
    }]`;
});

export const logger = winston.createLogger({
    level: args.debug ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.metadata(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(winston.format.colorize(), consoleLogFormat)
        }),
        new DailyRotateFile({
            filename: 'error-%DATE%',
            dirname: join(app.getPath('appData'), app.getName(), 'logs'),
            level: 'error',
            maxFiles: '7d',
            utc: true,
            zippedArchive: true,
            extension: '.log'
        }),
        new DailyRotateFile({
            filename: 'combined-%DATE%',
            dirname: join(app.getPath('appData'), app.getName(), 'logs'),
            maxSize: '20m',
            maxFiles: '7d',
            utc: true,
            zippedArchive: true,
            extension: '.log'
        })
    ]
});
