import db, { Database } from 'better-sqlite3';
import { createHash } from 'crypto';
import { app } from 'electron';
import EventEmitter from 'events';
import { copyFileSync, Dirent, existsSync, readdir } from 'fs';
import * as path from 'path';
import { join } from 'path';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';
import {
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../src/models/electron/invoke.channels';
import { LocalMapInfo } from '../../src/models/localMapInfo.model';
import { TSongId } from '../../src/models/played-songs.model';
import { TFileLoaded } from '../../src/models/types';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import MapHelpers from '../models/helpers/mapHelpers';
import { chacheLoader } from './cache.loader';
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

class InstalledSongs extends EventEmitter {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsInstallPath.value;
        return tempPath ? path.join(tempPath, 'Beat Saber_Data', 'CustomLevels') : '';
    }
    private _songIds: Set<string>;
    private _loaded: BehaviorSubject<TFileLoaded>;
    private _loading: boolean;
    private _db: Database;
    private __idsHash: string;
    private set _idsHash(val: string) {
        if (this.__idsHash !== val) {
            console.log('HASH CHANGE', val);

            this.__idsHash = val;
            this.emitIdsHash(val);
        }
    }
    private _localMapsSyncing: boolean;
    private _syncAgain: false | string;

    constructor() {
        super();
        this._syncAgain = this._localMapsSyncing = false;
        this.__idsHash = chacheLoader.readCache('ids_hash');
        this._loaded = new BehaviorSubject<TFileLoaded>(false);
        this._loading = false;
        this._songIds = new Set<string>();
        const dbFilePath = this._ensureDbFile();
        this._db = new db(dbFilePath, { fileMustExist: true, verbose: console.log });
        this.onIdsHash((hash: string) => {
            if (this._localMapsSyncing) {
                this._syncAgain = hash;
                return;
            }
            this._localMapsSyncing = true;
            this.syncInstalledSongs()
                .then(() => chacheLoader.writeCache('ids_hash', hash))
                .finally(() => {
                    this._localMapsSyncing = false;
                    if (this._syncAgain) {
                        this.emitIdsHash(this._syncAgain);
                        this._syncAgain = false;
                    }
                })
                .catch(error => appLogger().error(error));
        });
    }

    onIdsHash(cb: (hash: string) => void): this {
        return super.on('idsHash', cb);
    }

    emitIdsHash(hash: string): boolean {
        return super.emit('idsHash', hash);
    }

    syncInstalledSongs() {
        return new Promise<void>((res, rej) => {
            readdir(
                this._filePath,
                { withFileTypes: true },
                (err: NodeJS.ErrnoException | null, files: Dirent[]) => {
                    if (err) {
                        return rej(err);
                    }
                    try {
                        const songs = new Array<LocalMapInfo>();
                        for (const file of files) {
                            if (file.isDirectory())
                                songs.push(
                                    MapHelpers.getLocalMapInfo(
                                        join(this._filePath, file.name),
                                        file.name
                                    )
                                );
                        }
                        this.insertMapInfos(songs);
                        res();
                    } catch (error: any) {
                        rej(error);
                    }
                }
            );
        });
    }

    private insertMapInfos(mapInfos: LocalMapInfo[]): void {
        const insert = this._db.prepare(
            'REPLACE INTO maps (id, song_name, song_sub_name, song_author_name, level_author_name, bpm, cover_image_filename, difficulties, hash) ' +
                'VALUES (@id, @song_name, @song_sub_name, @song_author_name, @level_author_name, @bpm, @cover_image_filename, @difficulties, @hash)'
        );
        const insertMany = this._db.transaction((mapInfos: LocalMapInfo[]) => {
            for (const mapInfo of mapInfos) insert.run(mapInfo.toStorage());
        });
        return insertMany(mapInfos);
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
                        if (this._songIds) {
                            this._idsHash = createHash('sha1')
                                .update(Array.from(this._songIds).join(','))
                                .digest('hex');
                        }
                        res({ status: 'LOADED' });
                    } catch (error: any) {
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
                        } catch (error: any) {
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

    private _ensureDbFile(): string {
        const filePath = path.resolve(app.getPath('cache'), app.getName(), 'db.sqlite3');
        if (!existsSync(filePath)) {
            console.log('COPY');

            const templatePath = path.resolve('assets', 'db', 'db.sqlite3');
            copyFileSync(templatePath, filePath);
        }
        return filePath;
    }
}

const isntalledSongs = new InstalledSongs();
