import * as winston from 'winston';
import { TSendDebug, TSendError, TSendInfo } from '../../src/models/electron/send.channels';
import { IpcHelerps } from '../models/helpers/ipc-main.register';

export const loadDebugSender = IpcHelerps.ipcMainOn<TSendDebug>(
    'DEBUG',
    (event: Electron.IpcMainInvokeEvent, args: { msg: string; meta?: any }) => {
        return _logger.debug(args.msg, args.meta);
    }
);
export const loadInfoSender = IpcHelerps.ipcMainOn<TSendInfo>(
    'INFO',
    (event: Electron.IpcMainInvokeEvent, args: { msg: string; meta?: any }) => {
        return _logger.info(args.msg, args.meta);
    }
);
export const loadErrorSender = IpcHelerps.ipcMainOn<TSendError>(
    'ERROR',
    (event: Electron.IpcMainInvokeEvent, args: string | Error) => {
        return _logger.error(args);
    }
);

class Logger {
    private _logger: winston.Logger;

    constructor(logger: winston.Logger) {
        this._logger = logger;
    }

    debug(message: string, meta?: any): void {
        this._logger.debug(message, meta);
    }

    info(message: string, meta?: any): void {
        this._logger.info(message, meta);
    }

    error(error: Error | string): void {
        this._logger.error(error);
    }
}

let _logger: Logger;
export const appLogger = () => _logger;
export const initLogger = (logger: winston.Logger) => {
    if (!_logger) {
        _logger = new Logger(logger);
    }
    return _logger;
};
