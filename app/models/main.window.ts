import { BrowserWindow } from 'electron';
import { Rectangle } from 'electron/main';
import { resolve } from 'path';
import { EventEmitter } from 'stream';
import { Logger } from 'winston';
import { TSendClose, TSendReady, TSendReadyClose } from '../../src/models/electron/send.channels';
import { DownloadSender } from '../senders/download.sender';
import { IpcHelerps } from './helpers/ipc-main.register';
import { webContentsSend } from './helpers/web-contents-send.register';
import { WindowStorage } from './windowStorage.model';

export class MainWindow extends EventEmitter {
    private _window: BrowserWindow | null;
    private _windowStorage: WindowStorage;
    private _serve: boolean;
    private _debug: boolean;
    private _downloadSender?: DownloadSender;
    private _isReadyToClose: boolean;

    constructor(public logger: Logger) {
        super();
        this._isReadyToClose = this._serve = this._debug = false;
        for (const arg of process.argv) {
            if (arg === '--serve') this._serve = true;
            if (arg === '--debug') this._debug = true;
        }
        this._windowStorage = new WindowStorage();
        this._windowStorage.init();
        this._window = null;
        this._init();
    }

    onReady(cb: () => void): this {
        return super.on('ready', cb);
    }

    show(): void {
        this._window?.show();
        setTimeout(() => {
            this._window?.moveTop();
        }, 500);
    }

    private _emitReady(): boolean {
        return super.emit('ready');
    }

    private _init(): void {
        this._window = this._generateWindow();
        this._downloadSender = new DownloadSender(this._window);
        this._initOnReady(this._window);
        this._loadContent(this._window);
        this._initOnClose(this._window);
        this._initOnClosed(this._window);
    }

    private _generateWindow(): BrowserWindow {
        const { x, y, width, height } = this._getBounds();
        return new BrowserWindow({
            width,
            height,
            x,
            y,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            minHeight: 450,
            minWidth: 600,
            autoHideMenuBar: true,
            show: false
        });
    }

    private _initOnClose(window: BrowserWindow): void {
        window.on('close', (event: Electron.Event) => {
            if (!this._isReadyToClose && this._window) {
                IpcHelerps.ipcMainOn<TSendReadyClose>(
                    'ON_READY_CLOSE',
                    (event: Electron.IpcMainInvokeEvent) => {
                        this._isReadyToClose = true;
                        this._window?.close();
                    }
                );
                webContentsSend<TSendClose>(this._window, 'ON_CLOSE', undefined);
                return event.preventDefault();
            } else if (this._window) {
                this._windowStorage.saveCurrentState(this._window);
            }
        });
    }

    private _initOnClosed(window: BrowserWindow): void {
        window.on('closed', (event: Electron.Event) => {
            this.logger.debug('_createWindow closed');
            this._window = null;
        });
    }

    private _initOnReady(window: BrowserWindow): void {
        IpcHelerps.ipcMainOn<TSendReady>('READY', () => this._emitReady());
    }

    private _loadContent(window: BrowserWindow): void {
        if (this._serve) {
            this.logger.debug('_createWindow serve');
            window.loadURL('http://localhost:4200');
        } else {
            const path = resolve(__dirname, '..', '..', 'ui', 'index.html');
            this.logger.debug('_createWindow prod ' + path);
            window.loadFile(path);
        }
        if (this._debug) window.webContents.openDevTools();
    }

    private _getBounds(): Rectangle {
        if (this._windowStorage.data) {
            return this._windowStorage.data.bounds;
        } else {
            return this._windowStorage.init().bounds;
        }
    }
}
