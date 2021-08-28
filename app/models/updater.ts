import { NsisUpdater, ProgressInfo, UpdateCheckResult, UpdateInfo } from 'electron-updater';
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
        console.log('check', result);

        if (this._mainWindow.window) {
            IpcHelerps.webContentsSend<TSendUpdatefound>(
                this._mainWindow.window,
                'UPDATE_FOUND',
                result instanceof Error ? result : result?.updateInfo || null
            );
        }
        if (result instanceof Error) throw result;
        else return result;
    }

    update(): void {
        this._updater.quitAndInstall(false, true);
    }

    private _initOnDownloadPorgress(): void {
        this._updater.on(
            'download-progress',
            (
                progress: ProgressInfo,
                bytesPerSeconds: number,
                percent: number,
                total: number,
                transferred: number
            ) => {
                console.log(
                    'download-progress',
                    progress,
                    bytesPerSeconds,
                    percent,
                    total,
                    transferred
                );

                if (this._mainWindow.window) {
                    IpcHelerps.webContentsSend<TSendUpdateDlProgress>(
                        this._mainWindow.window,
                        'UPDATE_DL_PROGRESS',
                        { progress, bytesPerSeconds, percent, total, transferred }
                    );
                }
            }
        );
    }

    private _initOnUpdateDownloaded(): void {
        this._updater.on('update-downloaded', (info: UpdateInfo) => {
            console.log('update-downloaded', info);

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
