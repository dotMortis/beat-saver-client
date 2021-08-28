import { app, BrowserWindow } from 'electron';
import { join, resolve } from 'path';
import { args } from './models/args.model';
import { MainWindow } from './models/main.window';
import { SplashWindow } from './models/splash.window';
import { Updater } from './models/updater';
import { logger } from './models/winston.logger';
class IndexElectron {
    private _app: typeof app;
    private _window?: BrowserWindow | null;
    private _loaders: Map<string, { path: string; loader: any }>;
    private _mainWindow?: MainWindow;
    private _splashWindow?: SplashWindow;
    private _updater?: Updater;

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
            try {
                logger.debug('_startApp ready');
                this._splashWindow = new SplashWindow();
                this._mainWindow = new MainWindow(logger, { debug: args.debug });
                this._updater = new Updater(this._mainWindow);
                this._mainWindow?.onReady(() => {
                    if (this._mainWindow) this._mainWindow.show();
                    if (this._splashWindow) this._splashWindow.close();
                    setTimeout(() => {
                        this._updater
                            ?.checkForUpdatesAndNotify()
                            .catch(error => logger.error(error));
                    }, 1000);
                });
            } catch (error) {
                logger.error(error);
                app.exit();
            }
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
                this._mainWindow = new MainWindow(logger, { debug: args.debug });
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
