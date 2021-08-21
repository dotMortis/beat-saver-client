import { BrowserWindow } from 'electron';
import { v4 } from 'uuid';
import {
    TSendBrowserDownload,
    TSendBrowserDownloadAction
} from '../../src/models/electron/send.channels';
import { IpcHelerps } from '../models/helpers/ipc-main.register';
import { webContentsSend } from '../models/helpers/web-contents-send.register';

export class DownloadSender {
    private _window: BrowserWindow;
    private _downloads: Map<string, Electron.DownloadItem>;
    private _actionEvent: 'DOWNLOAD_ACTION';

    constructor(window: BrowserWindow) {
        this._actionEvent = IpcHelerps.ipcMainOn<TSendBrowserDownloadAction>(
            'DOWNLOAD_ACTION',
            (
                event: Electron.IpcMainInvokeEvent,
                args: { id: string; action: 'resume' | 'cancel' | 'pause' }
            ) => {
                const download = this._downloads.get(args.id);
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
        this._window = window;
        this._downloads = new Map<string, Electron.DownloadItem>();
        this._initDownloadEvents();
    }

    private _initDownloadEvents() {
        this._window.webContents.session.on(
            'will-download',
            (
                event: Electron.Event,
                item: Electron.DownloadItem,
                webContents: Electron.WebContents
            ) => {
                const onePercent = 100 / (item.getTotalBytes() || 1);
                const id = v4();
                this._downloads.set(id, item);
                item.on('updated', (event, state) => {
                    webContentsSend<TSendBrowserDownload>(this._window, 'DOWNLOAD', {
                        event: 'update',
                        filename: item.getFilename(),
                        state,
                        isPaused: item.isPaused(),
                        progress: Math.round(onePercent * item.getReceivedBytes()),
                        id
                    });
                });
                item.once('done', (event, state) => {
                    webContentsSend<TSendBrowserDownload>(this._window, 'DOWNLOAD', {
                        event: 'done',
                        filename: item.getFilename(),
                        state,
                        isPaused: item.isPaused(),
                        progress: Math.round(onePercent * item.getReceivedBytes()),
                        id
                    });
                    item.removeAllListeners();
                    this._downloads.delete(id);
                });
            }
        );
    }
}
