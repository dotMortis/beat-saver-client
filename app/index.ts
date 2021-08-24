import { app, BrowserWindow } from 'electron';
import { join, resolve } from 'path';
import * as winston from 'winston';
import { MainWindow } from './models/helpers/main.window';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: join(app.getPath('appData'), app.getName(), 'logs', 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: join(app.getPath('appData'), app.getName(), 'logs', 'combined.log')
        }),
        new winston.transports.Console({ level: 'debug' })
    ]
});
class IndexElectron {
    private _app: typeof app;
    private _window?: BrowserWindow | null;
    private _loaders: Map<string, { path: string; loader: any }>;
    private _mainWindow?: MainWindow;

    constructor(eleApp: typeof app, loaderPaths: string[]) {
        logger.debug('construct app');
        this._app = eleApp;
        this._loaders = new Map<string, any>(
            loaderPaths.map((loaderPath: string) => [
                loaderPath,
                { loader: undefined, path: loaderPath }
            ])
        );
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
            this._mainWindow = new MainWindow(logger);
        });

        this._app.on('window-all-closed', () => {
            logger.debug('_startApp window-all-closed');
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        this._app.on('activate', () => {
            logger.debug('_startApp activate');
            if (this._window === null) {
                this._mainWindow = new MainWindow(logger);
            }
        });
    }
}

const loaderRootDir = resolve(__dirname, 'loaders');
const electronApp = new IndexElectron(app, [
    join(loaderRootDir, 'cache.loader'),
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
        logger.error(error);
    });
