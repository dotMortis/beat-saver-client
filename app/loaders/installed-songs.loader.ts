import db, { Database } from 'better-sqlite3';
import { createHash } from 'crypto';
import { app } from 'electron';
import { copyFileSync, Dirent, existsSync, readdir, readdirSync } from 'fs';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';
import {
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../src/models/electron/invoke.channels';
import { TSendMapSyncStatus } from '../../src/models/electron/send.channels';
import { LocalMapInfo } from '../../src/models/localMapInfo.model';
import { TSongId } from '../../src/models/played-songs.model';
import { TFileLoaded } from '../../src/models/types';
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import MapHelpers from '../models/helpers/mapHelpers';
import { logger } from '../models/winston.logger';
import { cacheLoader } from './cache.loader';
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

class InstalledSongs extends CommonLoader {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsInstallPath.value;
        return tempPath ? path.join(tempPath, 'Beat Saber_Data', 'CustomLevels') : '';
    }
    private _songIds: Set<string>;
    private _loaded: BehaviorSubject<TFileLoaded>;
    private _loading: boolean;
    private _db: Database;
    private _currentIdsHash: string;
    private _localMapsSyncing: boolean;
    private _syncAgain: false | { hash: string; ids: string[] };

    constructor() {
        super();
        this._syncAgain = this._localMapsSyncing = false;
        this._currentIdsHash = cacheLoader.readCache('ids_hash');
        this._loaded = new BehaviorSubject<TFileLoaded>(false);
        this._loading = false;
        this._songIds = new Set<string>();
        const dbFilePath = this._ensureDbFile();
        this._db = new db(dbFilePath, { fileMustExist: true, verbose: logger.debug });
        this._initLocalMapSync();
    }

    onIdsHash(cb: (hash: string, ids: string[]) => void): this {
        return super.on('idsHash', cb);
    }

    emitIdsHash(hash: string, ids: string[]): boolean {
        return super.emit('idsHash', hash, ids);
    }

    syncInstalledSongs(idsCount: number): void {
        const files = readdirSync(this._filePath, { withFileTypes: true });
        const songs = new Array<LocalMapInfo>();
        let z = 0;
        for (const file of files) {
            if (file.isDirectory()) {
                IpcHelerps.webContentsSend<TSendMapSyncStatus>(
                    this.browserWindow,
                    'MAP_SYNC_STATUS',
                    {
                        status: 'SYNCING',
                        currentCount: ++z,
                        sum: idsCount
                    }
                );
                songs.push(MapHelpers.getLocalMapInfo(this._filePath, file.name));
            }
        }
        this._insertMapInfos(songs);
        IpcHelerps.webContentsSend<TSendMapSyncStatus>(this.browserWindow, 'MAP_SYNC_STATUS', {
            status: 'FINISH',
            currentCount: z,
            sum: idsCount
        });
    }

    async loadInstalledSongs(): Promise<{ status: TFileLoaded }> {
        logger.debug('loadInstalledSongs');
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
                            if (file.isDirectory()) this._songIds.add(file.name.split(' ')[0]);
                        }
                        this._setIdsHash(Array.from(this._songIds));
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
        logger.debug('songInstalled ' + songId);
        return this._handleLoadInstalledSongs<boolean>(async () => {
            if (!this._loaded) await this.loadInstalledSongs();
            return this._songIds?.has(songId) || false;
        });
    }

    private _initLocalMapSync(): void {
        this.onIdsHash((hash: string, ids: string[]) => {
            if (this._localMapsSyncing) {
                this._syncAgain = { hash, ids };
                return;
            }
            this._localMapsSyncing = true;
            try {
                this._deleteRemovedIds(ids);
                this.syncInstalledSongs(ids.length);
                cacheLoader.writeCache('ids_hash', hash);
            } catch (error: any) {
                logger.error(error);
                IpcHelerps.webContentsSend<TSendMapSyncStatus>(
                    this.browserWindow,
                    'MAP_SYNC_STATUS',
                    {
                        status: 'ERROR',
                        error: error,
                        sum: ids.length,
                        currentCount: 0
                    }
                );
            } finally {
                this._localMapsSyncing = false;
                if (this._syncAgain) {
                    this.emitIdsHash(this._syncAgain.hash, this._syncAgain.ids);
                    this._syncAgain = false;
                }
            }
        });
    }

    private _setIdsHash(ids: string[]) {
        const newHash = createHash('sha1').update(ids.join(',')).digest('hex');
        if (this._currentIdsHash !== newHash) {
            this._currentIdsHash = newHash;
            this.emitIdsHash(newHash, ids);
        }
    }

    private _deleteRemovedIds(availableIds: string[]): void {
        this._db.prepare('DELETE FROM maps WHERE id NOT IN(?)').run(availableIds.join(','));
    }

    private _insertMapInfos(mapInfos: LocalMapInfo[]): void {
        const insert = this._db.prepare(
            'REPLACE INTO maps (id, song_name, song_sub_name, song_author_name, level_author_name, bpm, cover_image_filename, difficulties, hash, folder_name) ' +
                'VALUES (@id, @song_name, @song_sub_name, @song_author_name, @level_author_name, @bpm, @cover_image_filename, @difficulties, @hash, @folder_name)'
        );
        const insertMany = this._db.transaction((mapInfos: LocalMapInfo[]) => {
            for (const mapInfo of mapInfos) insert.run(mapInfo.toStorage());
        });
        return insertMany(mapInfos);
    }

    private async _handleLoadInstalledSongs<RESULT = never>(
        onLoaded: () => Promise<RESULT>
    ): Promise<{ status: TFileLoaded; result: RESULT | undefined }> {
        logger.debug('_handleLoadInstalledSongs');
        return new Promise<{ status: TFileLoaded; result: RESULT | undefined }>((res, rej) => {
            this._loaded
                .pipe(
                    mergeMap(async (status: TFileLoaded) => {
                        try {
                            logger.debug('songInstalled', status);
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
                    logger.debug('_handleLoadInstalledSongs UNSUBSCRIBED');
                });
        });
    }

    private _ensureDbFile(): string {
        const filePath = path.resolve(app.getPath('cache'), app.getName(), 'db.sqlite3');
        if (!existsSync(filePath)) {
            const templatePath = path.resolve('assets', 'db', 'db.sqlite3');
            copyFileSync(templatePath, filePath);
        }
        return filePath;
    }
}

const isntalledSongs = new InstalledSongs();
export default isntalledSongs;
