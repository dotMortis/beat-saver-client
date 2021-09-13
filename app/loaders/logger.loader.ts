import * as winston from 'winston';
import { TSendDebug, TSendError, TSendInfo } from '../../src/models/electron/send.channels';
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import { MainWindow } from '../models/main.window';

export const loadDebugSender = IpcHelerps.ipcMainOn<TSendDebug>(
    'DEBUG',
    (event: Electron.IpcMainInvokeEvent, args: { msg: string; meta?: any }) => {
        return logger.debug(args.msg, args.meta);
    }
);
export const loadInfoSender = IpcHelerps.ipcMainOn<TSendInfo>(
    'INFO',
    (event: Electron.IpcMainInvokeEvent, args: { msg: string; meta?: any }) => {
        return logger.info(args.msg, args.meta);
    }
);
export const loadErrorSender = IpcHelerps.ipcMainOn<TSendError>(
    'ERROR',
    (event: Electron.IpcMainInvokeEvent, args: string | Error) => {
        return logger.error(args);
    }
);

class Logger extends CommonLoader {
    private _logger!: winston.Logger;

    init(window: MainWindow, logger: winston.Logger) {
        super.init(window);
        this._logger = logger;
    }

    debug(message: string, meta?: any): void {
        this._logger.debug(message, { data: meta });
    }

    info(message: string, meta?: any): void {
        this._logger.info(message, { data: meta });
    }

    error(error: Error | string): void {
        this._logger.error(error);
    }
}

export const logger = new Logger();
export default logger;
