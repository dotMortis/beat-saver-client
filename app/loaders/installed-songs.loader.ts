import { Dirent, readdir } from 'fs';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';
import {
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../src/models/electron/invoke.channels';
import { TSongId } from '../../src/models/played-songs.model';
import { TFileLoaded } from '../../src/models/types';
import { IpcHelerps } from '../models/helpers/ipc-main.register';
import { appLogger } from './logger.loader';
import { settings } from './settings.loader';

export const loadInstalledSongsHandle = IpcHelerps.ipcMainHandle<TInvokeLoadInstalledSongs>(
    'LOAD_INSTALLED_STATS',
    (event: Electron.IpcMainInvokeEvent, args: void) => {
        return isntalledSongs.loadInstalledSongs();
    }
);

export const songIsInstalledHandle = IpcHelerps.ipcMainHandle<TInvokeIsInstalled>(
    'SONG_IS_INSTALLED',
    (event: Electron.IpcMainInvokeEvent, args: { songId: TSongId }) => {
        const { songId } = args;
        return isntalledSongs.songInstalled(songId);
    }
);

class InstalledSongs {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsInstallPath.value;
        return tempPath ? path.join(tempPath, 'Beat Saber_Data', 'CustomLevels') : '';
    }
    private _songIds: Set<string>;
    private _loaded: BehaviorSubject<TFileLoaded>;
    private _loading: boolean;

    constructor() {
        this._loaded = new BehaviorSubject<TFileLoaded>(false);
        this._loading = false;
        this._songIds = new Set<string>();
    }

    async loadInstalledSongs(): Promise<{ status: TFileLoaded }> {
        appLogger().debug('loadInstalledSongs');
        if (this._loading) return { status: 'LOADING' };
        this._loading = true;
        if (!this._filePath) {
            this._loaded.next('NO_PATH');
            this._loaded.next(false);
            this._loading = false;
            return { status: 'NO_PATH' };
        }
        this._loaded.next('LOADING');
        return new Promise<{ status: TFileLoaded }>(res => {
            readdir(
                this._filePath,
                { withFileTypes: true },
                (err: NodeJS.ErrnoException | null, files: Dirent[]) => {
                    if (err) {
                        return res({ status: 'INVALID_PATH' });
                    }
                    try {
                        this._songIds.clear();
                        for (const file of files) {
                            if (file.isDirectory()) this._songIds?.add(file.name.split(' ')[0]);
                        }
                        res({ status: 'LOADED' });
                    } catch (error) {
                        res({ status: error });
                    }
                }
            );
        })
            .then(result => {
                this._loaded.next(result.status);
                if (result.status !== 'LOADED' && result.status !== 'LOADING') {
                    this._loaded.next(false);
                }
                return result;
            })
            .finally(() => {
                this._loading = false;
            });
    }

    async songInstalled(
        songId: TSongId
    ): Promise<{ status: TFileLoaded; result: boolean | undefined }> {
        appLogger().debug('songInstalled ' + songId);
        return this._handleLoadInstalledSongs<boolean>(async () => {
            if (!this._loaded) await this.loadInstalledSongs();
            return this._songIds?.has(songId) || false;
        });
    }

    private async _handleLoadInstalledSongs<RESULT = never>(
        onLoaded: () => Promise<RESULT>
    ): Promise<{ status: TFileLoaded; result: RESULT | undefined }> {
        appLogger().debug('_handleLoadInstalledSongs');
        return new Promise<{ status: TFileLoaded; result: RESULT | undefined }>((res, rej) => {
            this._loaded
                .pipe(
                    mergeMap(async (status: TFileLoaded) => {
                        try {
                            appLogger().debug('songInstalled', status);
                            switch (status) {
                                case false: {
                                    await this.loadInstalledSongs();
                                    break;
                                }
                                case 'LOADED': {
                                    return { status, result: await onLoaded() };
                                }
                                default: {
                                    break;
                                }
                            }
                            return { status, result: undefined };
                        } catch (error) {
                            return { status: error, result: undefined };
                        }
                    }),
                    takeWhile(
                        (result: { result: RESULT | undefined; status: TFileLoaded }) =>
                            result.status !== 'LOADED' &&
                            !(result.status instanceof Error) &&
                            result.status !== 'INVALID_PATH' &&
                            result.status !== 'NO_PATH',
                        true
                    )
                )
                .subscribe(result => {
                    if (result.status !== false && result.status !== 'LOADING') {
                        if (result.status instanceof Error) {
                            rej(result.status);
                        } else {
                            res(result);
                        }
                    }
                })
                .add(() => {
                    appLogger().debug('_handleLoadInstalledSongs UNSUBSCRIBED');
                });
        });
    }
}

const isntalledSongs = new InstalledSongs();
