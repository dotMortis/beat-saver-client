import { app, BrowserWindow } from 'electron';
import { join, resolve, sep } from 'path';
import { args } from './models/args.model';
import { CommonLoader } from './models/CommonLoader.model';
import { MainWindow } from './models/main.window';
import { SplashWindow } from './models/splash.window';
import { Updater } from './models/updater';
import { logger } from './models/winston.logger';
class IndexElectron {
    private _app: typeof app;
    private _window?: BrowserWindow | null;
    private _loaders: Map<string, { path: string; loader: CommonLoader }>;
    private _mainWindow?: MainWindow;
    private _splashWindow?: SplashWindow;
    private _updater?: Updater;

    constructor(eleApp: typeof app, loaderPaths: string[]) {
        logger.debug('construct app');
        this._app = eleApp;
        this._loaders = new Map<string, any>(
            loaderPaths.map((loaderPath: string) => [
                loaderPath.split(sep).slice(-1)[0].split('.')[0],
                { loader: undefined, path: loaderPath }
            ])
        );
        logger.debug('finish construct app');
    }

    public async init(): Promise<void> {
        logger.debug('init app');
        await this._loadLoaders();
        this._startApp();
        logger.debug('finish init app');
    }

    private async _loadLoaders(): Promise<void> {
        logger.debug('_initLoaders');
        if (this._loaders != null) {
            for (const [name, loader] of this._loaders) {
                loader.loader = (await import(loader.path)).default;
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
                this._initLoaders(this._mainWindow);
                this._updater = new Updater(this._mainWindow);
                this._mainWindow.onReady(() => {
                    logger.debug('ON_READY');
                    if (this._mainWindow) this._mainWindow.show();
                    if (this._splashWindow) this._splashWindow.close();
                    setTimeout(() => {
                        this._updater
                            ?.checkForUpdatesAndNotify()
                            .catch(error => logger.error(error));
                    }, 1000);
                });
                this._mainWindow.init().catch(error => {
                    logger.error(error);
                    app.exit();
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
                this._initLoaders(this._mainWindow);
                this._mainWindow.init().catch(error => {
                    logger.error(error);
                    app.exit();
                });
            }
        });
    }

    private _initLoaders(window: MainWindow): void {
        for (const [name, loader] of this._loaders) {
            if (name !== 'logger') {
                loader.loader.init(window);
            } else {
                loader.loader.init(window, logger);
            }
        }
    }
}

const loaderRootDir = resolve(__dirname, 'loaders');
const electronApp = new IndexElectron(app, [
    join(loaderRootDir, 'logger.loader'),
    join(loaderRootDir, 'cache.loader'),
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
