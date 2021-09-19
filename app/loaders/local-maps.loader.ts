import db, { Database } from 'better-sqlite3';
import { createHash } from 'crypto';
import { app } from 'electron';
import {
    copyFileSync,
    Dirent,
    existsSync,
    mkdirSync,
    readdir,
    readdirSync,
    rmSync,
    writeFileSync
} from 'fs';
import JSZip from 'jszip';
import * as path from 'path';
import { join, sep } from 'path';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';
import { TMapDetail, TMapVersion } from '../../src/models/api/api.models';
import { TFileLoaded } from '../../src/models/electron/file-loaded.model';
import {
    TInvokeDeleteSong,
    TInvokeFilterLocalMaps,
    TInvokeInstallSong,
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../src/models/electron/invoke.channels';
import { TSendMapSyncStatus } from '../../src/models/electron/send.channels';
import { LocalMapInfo, TDBLocalMapInfo } from '../../src/models/maps/localMapInfo.model';
import { TSongId } from '../../src/models/maps/map-ids.model';
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import MapHelpers from '../models/helpers/mapHelpers';
import { sanitize } from '../models/helpers/sanitize.model';
import { logger } from '../models/winston.logger';
import { settings } from './settings.loader';

export const loadInstalledSongsHandle = IpcHelerps.ipcMainHandle<TInvokeLoadInstalledSongs>(
    'LOAD_INSTALLED_STATS',
    (event: Electron.IpcMainInvokeEvent, args: void) => {
        return localMaps.loadInstalledMaps();
    }
);

export const mapIsInstalledHandle = IpcHelerps.ipcMainHandle<TInvokeIsInstalled>(
    'SONG_IS_INSTALLED',
    (event: Electron.IpcMainInvokeEvent, args: { mapId: TSongId }) => {
        const { mapId } = args;
        return localMaps.mapIsInstalled(mapId);
    }
);

export const filterLocalMapsHandle = IpcHelerps.ipcMainHandle<TInvokeFilterLocalMaps>(
    'FILTER_LOCAL_MAPS',
    async (event: Electron.IpcMainInvokeEvent, args: { q: string | undefined; page: number }) => {
        try {
            const { q, page } = args;
            return localMaps.getFilteredLocalMaps(page, q);
        } catch (error: any) {
            return error;
        }
    }
);

export const deleteSongHandle = IpcHelerps.ipcMainHandle<TInvokeDeleteSong>(
    'DELETE_SONG',
    async (event: Electron.IpcMainInvokeEvent, args: { id: TSongId }) => {
        const { id } = args;
        return localMaps.deleteSong(id);
    }
);

export const installSongHandle = IpcHelerps.ipcMainHandle<TInvokeInstallSong>(
    'INSTALL_SONG',
    async (
        event: Electron.IpcMainInvokeEvent,
        args: { arrayBuffer: ArrayBuffer; mapDetail: TMapDetail; latestVersion: TMapVersion }
    ) => {
        return localMaps.installSong(args);
    }
);

class LocalMaps extends CommonLoader {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsInstallPath.value;
        if (!tempPath) {
            throw new Error('Missing BS install path');
        } else if (!existsSync(tempPath)) {
            throw new Error('Invalid BS install path');
        } else {
            return path.join(tempPath, 'Beat Saber_Data', 'CustomLevels');
        }
    }
    private _mapIds: Set<string>;
    private _loaded: BehaviorSubject<TFileLoaded>;
    private _loading: boolean;
    private _db: Database;
    private _localMapsSyncing: boolean;
    private _syncAgain: false | { hash: string; localIds: string[]; dbIds: string[] };

    constructor() {
        super();
        this._syncAgain = this._localMapsSyncing = false;
        this._loaded = new BehaviorSubject<TFileLoaded>(false);
        this._loading = false;
        this._mapIds = new Set<string>();
        const dbFilePath = this._ensureDbFile();
        this._db = new db(dbFilePath, { fileMustExist: true, verbose: logger.debug });
        this._initLocalMapSync();
    }

    onIdsHash(cb: (hash: string, localIds: string[], dbIds: string[]) => void): this {
        return super.on('idsHash', cb);
    }

    emitIdsHash(hash: string, localIds: string[], dbIds: string[]): boolean {
        return super.emit('idsHash', hash, localIds, dbIds);
    }

    syncInstalledSongs(localIds: string[], dbIds: string[]): void {
        this._deleteRemovedIds(localIds);
        const idsCount = localIds.length;
        const files = readdirSync(this._filePath, { withFileTypes: true });
        const maps = new Array<LocalMapInfo>();
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
                maps.push(MapHelpers.getLocalMapInfo(this._filePath, file.name));
            }
        }
        this._insertMapInfos(maps);
        IpcHelerps.webContentsSend<TSendMapSyncStatus>(this.browserWindow, 'MAP_SYNC_STATUS', {
            status: 'FINISH',
            currentCount: z,
            sum: idsCount
        });
    }

    getFilteredLocalMaps(page: number, q: string | undefined): LocalMapInfo[] {
        let query = 'SELECT * FROM maps';
        if (q) {
            query +=
                ' WHERE song_name LIKE :q OR id LIKE :q OR song_sub_name LIKE :q OR song_author_name LIKE :q OR level_author_name LIKE :q OR hash LIKE :q';
        }
        query += ' ORDER BY song_name ASC LIMIT 20 OFFSET :skip';
        const find = this._db.prepare(query);
        return find
            .all({ q, skip: page * 20 })
            .map((info: TDBLocalMapInfo) => new LocalMapInfo(info));
    }

    deleteSong(id: TSongId): true | Error {
        try {
            const folderName = this._getFolderName(id);
            if (folderName) {
                rmSync(join(this._filePath, folderName), { recursive: true, force: true });
                this._deleteMapInfo(id);
            }
            return true;
        } catch (error: any) {
            logger.error(error);
            return error;
        }
    }

    async installSong(info: {
        arrayBuffer: ArrayBuffer;
        mapDetail: TMapDetail;
        latestVersion: TMapVersion;
    }) {
        try {
            const zip = await JSZip.loadAsync(info.arrayBuffer);

            const subFolder = sanitize(
                `${info.mapDetail.id} (${info.mapDetail.metadata.songName} - ${info.mapDetail.metadata.levelAuthorName})`
            );
            for (const filename of Object.keys(zip.files)) {
                const file = zip.files[filename];
                if (file.name.endsWith(sep)) {
                    this._createFolder(subFolder, file.name);
                } else {
                    const content = await file.async('nodebuffer');
                    this._saveFile(subFolder, file.name, content);
                }
            }
            const mapInfo = MapHelpers.getLocalMapInfo(this._filePath, subFolder);
            this._insertMapInfos([mapInfo]);
            return { result: true };
        } catch (error: any) {
            return { result: error };
        }
    }

    async loadInstalledMaps(): Promise<{ status: TFileLoaded }> {
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
                        this._mapIds.clear();
                        for (const file of files) {
                            if (file.isDirectory()) this._mapIds.add(file.name.split(' ')[0]);
                        }
                        this._setIdsHash(Array.from(this._mapIds));
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

    async mapIsInstalled(
        mapId: TSongId
    ): Promise<{ status: TFileLoaded; result: boolean | undefined }> {
        logger.debug('mapIsInstalled ' + mapId);
        return this._handleLoadInstalledSongs<boolean>(
            async () => this._mapIds?.has(mapId) || false
        );
    }

    private _saveFile(folderName: string, filename: string, buffer: Buffer): void {
        const folderPath = this._getFolderPath(folderName);
        this._createFolder(folderName);
        writeFileSync(path.join(folderPath, filename), buffer, { flag: 'w' });
    }

    private _createFolder(...folderNames: string[]): void {
        const folderPath = this._getFolderPath(...folderNames);
        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }
    }

    private _getFolderPath(...folderNames: string[]): string {
        return path.join(this._filePath, ...folderNames);
    }

    private _initLocalMapSync(): void {
        this.onIdsHash((hash: string, localIds: string[], dbIds: string[]) => {
            if (this._localMapsSyncing) {
                this._syncAgain = { hash, localIds, dbIds };
                return;
            }
            this._localMapsSyncing = true;
            try {
                this.syncInstalledSongs(localIds, dbIds);
            } catch (error: any) {
                logger.error(error);
                IpcHelerps.webContentsSend<TSendMapSyncStatus>(
                    this.browserWindow,
                    'MAP_SYNC_STATUS',
                    {
                        status: 'ERROR',
                        error: error,
                        sum: localIds.length,
                        currentCount: 0
                    }
                );
            } finally {
                this._localMapsSyncing = false;
                if (this._syncAgain) {
                    this.emitIdsHash(
                        this._syncAgain.hash,
                        this._syncAgain.localIds,
                        this._syncAgain.dbIds
                    );
                    this._syncAgain = false;
                }
            }
        });
    }

    private _setIdsHash(localIds: string[]) {
        const newHash = this._computeIdsHash(localIds);
        const dbHashInfo = this._getDbIdsHash();
        if (dbHashInfo.hash !== newHash) {
            this.emitIdsHash(newHash, localIds, dbHashInfo.ids);
        }
    }

    private _getFolderName(id: TSongId): string | undefined {
        return this._db.prepare('SELECT folder_name FROM maps WHERE id = :id').get({ id })
            ?.folder_name;
    }

    private _deleteRemovedIds(availableIds: string[]): void {
        this._db.prepare('DELETE FROM maps WHERE id NOT IN(?)').run(availableIds.join(','));
    }

    private _getDbIdsHash(): { hash: string; ids: string[] } {
        const maps: { id: string }[] = this._db.prepare('SELECT id FROM maps').all();
        const ids = maps.map(map => map.id);
        return { ids, hash: this._computeIdsHash(ids) };
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

    private _deleteMapInfo(id: TSongId): void {
        this._db.prepare('DELETE FROM maps WHERE id = :id').run({ id });
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
                            logger.debug('mapInstalled', status);
                            switch (status) {
                                case false: {
                                    await this.loadInstalledMaps();
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

    private _computeIdsHash(ids: string[]): string {
        return createHash('sha1').update(ids.join(',')).digest('hex');
    }
}

const localMaps = new LocalMaps();
export default localMaps;