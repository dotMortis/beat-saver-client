import db, { Database } from 'better-sqlite3';
import { createHash } from 'crypto';
import { app } from 'electron';
import {
    Dirent,
    existsSync,
    mkdirSync,
    readdir,
    readdirSync,
    readFileSync,
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
    TInvokeGetLocalCover,
    TInvokeInstallSong,
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs,
    TInvokeMapsCount
} from '../../src/models/electron/invoke.channels';
import {
    TSendMapInstallChange,
    TSendMapsCount,
    TSendMapSyncStatus
} from '../../src/models/electron/send.channels';
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
    async (event: Electron.IpcMainInvokeEvent, args: void) => {
        try {
            return await localMaps.loadInstalledMaps();
        } catch (error: any) {
            return error;
        }
    }
);

export const mapIsInstalledHandle = IpcHelerps.ipcMainHandle<TInvokeIsInstalled>(
    'SONG_IS_INSTALLED',
    async (event: Electron.IpcMainInvokeEvent, args: { mapId: TSongId }) => {
        try {
            const { mapId } = args;
            return await localMaps.mapIsInstalled(mapId);
        } catch (error: any) {
            return error;
        }
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
        try {
            const { id } = args;
            return localMaps.deleteSong(id);
        } catch (error: any) {
            return error;
        }
    }
);

export const installSongHandle = IpcHelerps.ipcMainHandle<TInvokeInstallSong>(
    'INSTALL_SONG',
    async (
        event: Electron.IpcMainInvokeEvent,
        args: { arrayBuffer: ArrayBuffer; mapDetail: TMapDetail; latestVersion: TMapVersion }
    ) => {
        try {
            return await localMaps.installSong(args);
        } catch (error: any) {
            return error;
        }
    }
);

export const getLocalCoverHandle = IpcHelerps.ipcMainHandle<TInvokeGetLocalCover>(
    'GET_LOCAL_COVER',
    async (event: Electron.IpcMainInvokeEvent, args: { id: TSongId }) => {
        try {
            return localMaps.getLocalMapCover(args.id);
        } catch (error: any) {
            return error;
        }
    }
);

export const countMapsHandle = IpcHelerps.ipcMainHandle<TInvokeMapsCount>(
    'MAPS_COUNT',
    async (event: Electron.IpcMainInvokeEvent) => {
        return localMaps.getCurrentMapsCount();
    }
);

class LocalMaps extends CommonLoader {
    private get _filePath(): string | null {
        const tempPath = settings.getOpts().bsInstallPath.value;
        if (!tempPath || !existsSync(tempPath)) {
            return null;
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
        const dbFilePath = path.resolve(app.getPath('cache'), app.getName(), 'db.sqlite3');
        this._db = new db(dbFilePath, { fileMustExist: true, verbose: logger.debug });
        this._initLocalMapSync();
    }

    getLocalMapCover(id: TSongId): string {
        const coverUrl = this._getCoverUrl(id);
        return readFileSync(coverUrl).toString('base64');
    }

    syncInstalledSongs(localIds: string[], dbIds: string[]): void {
        this._deleteRemovedIds(localIds);
        const idsCount = localIds.length;
        if (!this._filePath) return;
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
                try {
                    const localMapInfo = MapHelpers.getLocalMapInfo(this._filePath, file.name);
                    maps.push(localMapInfo);
                } catch (error: any) {
                    logger.error(error, { customSongFolderName: file.name });
                    const id = file.name.split(' ')[0];
                    const dummyLocalMapInfo = LocalMapInfo.getDummyData(id, file.name);
                    maps.push(dummyLocalMapInfo);
                }
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

    deleteSong(id: TSongId): true {
        const folderName = this._getFolderName(id);
        if (folderName) {
            if (!this._filePath) return true;
            rmSync(join(this._filePath, folderName), { recursive: true, force: true });
            this._deleteMapInfo(id);
        }
        IpcHelerps.webContentsSend<TSendMapInstallChange>(
            this.browserWindow,
            'MAP_INSTALL_CHANGED',
            { songId: id, installed: false }
        );
        return true;
    }

    async installSong(info: {
        arrayBuffer: ArrayBuffer;
        mapDetail: TMapDetail;
        latestVersion: TMapVersion;
    }): Promise<{ result: true }> {
        if (!this._filePath) throw new Error('BS install path not found');

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
        IpcHelerps.webContentsSend<TSendMapInstallChange>(
            this.browserWindow,
            'MAP_INSTALL_CHANGED',
            { songId: mapInfo.id, installed: true }
        );
        return { result: true };
    }

    async loadInstalledMaps(): Promise<{ status: TFileLoaded }> {
        logger.debug('loadInstalledSongs');
        if (this._loading) return { status: 'LOADING' };
        this._loading = true;
        this._loaded.next('LOADING');
        return new Promise<{ status: TFileLoaded }>(res => {
            if (!this._filePath) {
                return res({ status: 'NO_PATH' });
            }
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

    getCurrentMapsCount(): number {
        const count: { c: number } = this._db.prepare('SELECT COUNT(*) as c FROM maps').get();
        return count.c;
    }

    private _onIdsHash(cb: (hash: string, localIds: string[], dbIds: string[]) => void): this {
        return super.on('idsHash', cb);
    }

    private _emitIdsHash(hash: string, localIds: string[], dbIds: string[]): boolean {
        return super.emit('idsHash', hash, localIds, dbIds);
    }

    private _saveFile(folderName: string, filename: string, buffer: Buffer): void {
        const folderPath = this._getFolderPath(folderName);
        if (!folderPath) return;
        this._createFolder(folderName);
        writeFileSync(path.join(folderPath, filename), buffer, { flag: 'w' });
    }

    private _createFolder(...folderNames: string[]): void {
        const folderPath = this._getFolderPath(...folderNames);
        if (folderPath && !existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }
    }

    private _getFolderPath(...folderNames: string[]): string | null {
        if (!this._filePath) return null;
        return path.join(this._filePath, ...folderNames);
    }

    private _initLocalMapSync(): void {
        this._onIdsHash((hash: string, localIds: string[], dbIds: string[]) => {
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
                    this._emitIdsHash(
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
            this._emitIdsHash(newHash, localIds, dbHashInfo.ids);
        }
    }

    private _getFolderName(id: TSongId): string | undefined {
        return this._db.prepare('SELECT folder_name FROM maps WHERE id = :id').get({ id })
            ?.folder_name;
    }

    private _getCoverUrl(id: TSongId): string {
        const result = this._db
            .prepare('SELECT folder_name, cover_image_filename FROM maps WHERE id = :id')
            .get({ id });
        if (!result) throw new Error('Error map info not found');
        if (!this._filePath) throw new Error('BS install path not found');
        return join(this._filePath, result.folder_name, result.cover_image_filename);
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
        insertMany(mapInfos);
        this._pushLocalSongsCount();
    }

    private _deleteMapInfo(id: TSongId): void {
        this._db.prepare('DELETE FROM maps WHERE id = :id').run({ id });
        this._pushLocalSongsCount();
    }

    private _deleteRemovedIds(availableIds: string[]): void {
        this._db.prepare('DELETE FROM maps WHERE id NOT IN(?)').run(availableIds.join(','));
        this._pushLocalSongsCount();
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

    private _computeIdsHash(ids: string[]): string {
        ids.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
        const hash = createHash('sha1');
        for (const id of ids) {
            hash.update(id);
        }
        return hash.digest('hex');
    }

    private _pushLocalSongsCount(): void {
        const count = this.getCurrentMapsCount();
        IpcHelerps.webContentsSend<TSendMapsCount>(this.browserWindow, 'MAPS_COUNT', count);
    }
}

const localMaps = new LocalMaps();
export default localMaps;
