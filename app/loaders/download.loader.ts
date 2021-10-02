import { v4 } from 'uuid';
import {
    TSendBrowserDownload,
    TSendBrowserDownloadAction,
    TSendEmitDownload
} from '../../src/models/electron/send.channels';
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import { MainWindow } from '../models/main.window';

const sendBrowserDownloadAction = IpcHelerps.ipcMainOn<TSendBrowserDownloadAction>(
    'DOWNLOAD_ACTION',
    (
        event: Electron.IpcMainInvokeEvent,
        args: { id: string; action: 'resume' | 'cancel' | 'pause' }
    ) => {
        const download = downloader.downloads.get(args.id);
        if (download) {
            switch (args.action) {
                case 'cancel': {
                    download.cancel();
                    break;
                }
                case 'pause': {
                    download.pause();
                    break;
                }
                case 'resume': {
                    download.resume();
                    break;
                }
            }
        }
    }
);

const sendEmitDownload = IpcHelerps.ipcMainOn<TSendEmitDownload>(
    'EMIT_DOWNLOAD',
    (event: Electron.IpcMainInvokeEvent, url: string) => {
        downloader.browserWindow.webContents.downloadURL(url);
    }
);

class DownloaderLoader extends CommonLoader {
    public downloads: Map<string, Electron.DownloadItem>;

    constructor() {
        super();

        this.downloads = new Map<string, Electron.DownloadItem>();
    }

    init(mainWindow: MainWindow) {
        super.init(mainWindow);
        mainWindow.onceReady(() => this._initDownloadEvents());
    }

    private _initDownloadEvents() {
        this.browserWindow.webContents.session.on(
            'will-download',
            (
                event: Electron.Event,
                item: Electron.DownloadItem,
                webContents: Electron.WebContents
            ) => {
                const onePercent = 100 / (item.getTotalBytes() || 1);
                const id = v4();
                this.downloads.set(id, item);
                item.on('updated', (event, state) => {
                    IpcHelerps.webContentsSend<TSendBrowserDownload>(
                        this.browserWindow,
                        'DOWNLOAD',
                        {
                            event: 'update',
                            filename: item.getFilename(),
                            state,
                            isPaused: item.isPaused(),
                            progress: Math.round(onePercent * item.getReceivedBytes()),
                            id
                        }
                    );
                });
                item.once('done', (event, state) => {
                    IpcHelerps.webContentsSend<TSendBrowserDownload>(
                        this.browserWindow,
                        'DOWNLOAD',
                        {
                            event: 'done',
                            filename: item.getFilename(),
                            state,
                            isPaused: item.isPaused(),
                            progress: Math.round(onePercent * item.getReceivedBytes()),
                            id
                        }
                    );
                    item.removeAllListeners();
                    this.downloads.delete(id);
                });
            }
        );
    }
}

const downloader = new DownloaderLoader();
export default downloader;
