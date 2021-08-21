import { app, BrowserWindow } from 'electron';
import { join, resolve } from 'path';
import * as winston from 'winston';
import { DownloadSender } from './senders/download.sender';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: join(app.getPath('appData'), 'beat-saver-ui', 'logs', 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: join(app.getPath('appData'), 'beat-saver-ui', 'logs', 'combined.log')
        }),
        new winston.transports.Console({ level: 'debug' })
    ]
});
class IndexElectron {
    private _app: typeof app;
    private _serve: boolean;
    private _debug: boolean;
    private _windows?: BrowserWindow | null;
    private _loaders: Map<string, { path: string; loader: any }>;
    private _sender: Map<string, any>;

    constructor(eleApp: typeof app, loaderPaths: string[]) {
        logger.debug('construct app');
        this._app = eleApp;
        this._serve = this._debug = false;
        for (const arg of process.argv) {
            if (arg === '--serve') this._serve = true;
            if (arg === '--debug') this._debug = true;
        }
        this._loaders = new Map<string, any>(
            loaderPaths.map((loaderPath: string) => [
                loaderPath,
                { loader: undefined, path: loaderPath }
            ])
        );
        this._sender = new Map<string, any>();
        logger.debug('finish construct app');
    }

    public async init(): Promise<void> {
        logger.debug('init app');
        await this._initLoaders();
        this._startApp();
        logger.debug('finish init app');
    }

    private async _initLoaders(): Promise<void> {
        logger.debug('_initLoaders');
        if (this._loaders != null) {
            for (const [loaderPath, loader] of this._loaders) {
                loader.loader = await import(loaderPath);
                if (loaderPath.endsWith('logger.loader')) {
                    loader.loader.initLogger(logger);
                }
            }
        }
        logger.debug('finish _initLoaders');
    }

    private _startApp(): void {
        logger.debug('_startApp');
        this._app.on('ready', () => {
            logger.debug('_startApp ready');
            this._createWindow();
        });

        // Quit when all windows are closed.
        this._app.on('window-all-closed', () => {
            logger.debug('_startApp window-all-closed');
            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        this._app.on('activate', () => {
            logger.debug('_startApp activate');
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (this._windows === null) {
                this._createWindow();
            }
        });
        logger.debug('finish _startApp');
    }

    private _createWindow(): void {
        logger.debug('_createWindow');
        // Create the browser window.
        this._windows = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this._sender.set('download', new DownloadSender(this._windows));

        if (this._serve) {
            logger.debug('_createWindow serve');
            // and load the index.html of the app.
            this._windows.loadURL('http://localhost:4200');
        } else {
            const path = resolve(__dirname, '..', 'ui', 'index.html');
            logger.debug('_createWindow prod ' + path);
            this._windows.loadFile(path);
        }

        // Open the DevTools.
        if (this._debug) this._windows.webContents.openDevTools();

        // Emitted when the window is closed.
        this._windows.on('closed', () => {
            logger.debug('_createWindow closed');
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this._windows = null;
        });
        logger.debug('finish _createWindow');
    }
}

const loaderRootDir = resolve(__dirname, 'loaders');
const electronApp = new IndexElectron(app, [
    join(loaderRootDir, 'logger.loader'),
    join(loaderRootDir, 'settings.loader'),
    join(loaderRootDir, 'played-songs.loader'),
    join(loaderRootDir, 'installed-songs.loader'),
    join(loaderRootDir, 'install.loader')
]);
electronApp
    .init()
    .then(() => {
        logger.debug('Electron started');
    })
    .catch(error => {
        console.log('ERROR', error);

        logger.error(error);
    });
