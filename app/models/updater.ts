import { NsisUpdater, ProgressInfo, UpdateCheckResult, UpdateInfo } from 'electron-updater';
import { version } from '../../package.json';
import {
    TSendCheckUpdates,
    TSendUpdate,
    TSendUpdateDlProgress,
    TSendUpdateDownlaoded,
    TSendUpdatefound
} from '../../src/models/electron/send.channels';
import { IpcHelerps } from './helpers/ipc-main.helpers';
import { MainWindow } from './main.window';
import { logger } from './winston.logger';

export class Updater {
    private _updater: NsisUpdater;

    constructor(private _mainWindow: MainWindow) {
        this._updater = new NsisUpdater({
            requestHeaders: {
                'Cache-Control': ' no-cache, no-store, must-revalidate'
            },
            provider: 'github',
            owner: 'dotMortis',
            repo: 'beat-saver-client'
        });
        this._updater.logger = logger;
        this._updater.allowPrerelease = true;
        this._updater.autoDownload = true;
        this._updater.autoInstallOnAppQuit = true;
        this._initOnDownloadPorgress();
        this._initOnUpdateDownloaded();
        IpcHelerps.ipcMainOn<TSendUpdate>('UPDATE', (event: Electron.IpcMainInvokeEvent) => {
            this.update();
        });
    }

    async checkForUpdatesAndNotify(): Promise<UpdateCheckResult | null> {
        if (this._mainWindow.window) {
            IpcHelerps.webContentsSend<TSendCheckUpdates>(
                this._mainWindow.window,
                'CHECK_UPDATES',
                undefined
            );
        }
        const result = await this._updater
            .checkForUpdatesAndNotify({
                title: 'BeatSaver Updater',
                body: 'Checking for updates'
            })
            .catch((e: Error) => e);
        logger.debug('CHECK', { data: result });

        if (this._mainWindow.window) {
            let updateFoundResult: TSendUpdatefound['args'];
            if (result instanceof Error) {
                updateFoundResult = result;
            } else if (!result || result.updateInfo.version.includes(version)) {
                updateFoundResult = null;
            } else {
                updateFoundResult = result.updateInfo;
            }
            IpcHelerps.webContentsSend<TSendUpdatefound>(
                this._mainWindow.window,
                'UPDATE_FOUND',
                updateFoundResult
            );
        }
        if (result instanceof Error) throw result;
        else return result;
    }

    update(): void {
        this._updater.quitAndInstall(false, true);
    }

    private _initOnDownloadPorgress(): void {
        this._updater.on('download-progress', (progress: ProgressInfo) => {
            logger.debug('download-progress', { data: progress });

            if (this._mainWindow.window) {
                IpcHelerps.webContentsSend<TSendUpdateDlProgress>(
                    this._mainWindow.window,
                    'UPDATE_DL_PROGRESS',
                    progress
                );
            }
        });
    }

    private _initOnUpdateDownloaded(): void {
        this._updater.on('update-downloaded', (info: UpdateInfo) => {
            logger.debug('update-downloaded', { data: info });

            if (this._mainWindow.window) {
                IpcHelerps.webContentsSend<TSendUpdateDownlaoded>(
                    this._mainWindow.window,
                    'UPDATE_DOWNLOADED',
                    info
                );
            }
        });
    }
}
