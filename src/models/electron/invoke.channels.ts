import { TMapDetail, TMapVersion } from '../api/api.models';
import { ILocalMapInfo } from '../maps/localMapInfo.model';
import { TSongHash, TSongId } from '../maps/map-ids.model';
import { TLevelStatsInfo } from '../player/player-data.model';
import { TSettings } from '../settings.model';
import { TFileLoaded } from './file-loaded.model';

export type TInvoke<CHANNEL extends string, ARGS, RETURN_VALUE> = {
    channel: CHANNEL;
    args: ARGS;
    retrunValue: RETURN_VALUE | Error;
};

//#region PLAYER STATS
export type TInvokeLoadPlayedSongs = TInvoke<'LOAD_PLAYER_STATS', void, { status: TFileLoaded }>;

export type TInvokeGetPlayerSongStats = TInvoke<
    'GET_PLAYER_SONG_STATS',
    { playerName: string; mapHash: TSongHash },
    { status: TFileLoaded; result: TLevelStatsInfo | undefined }
>;

export type TInvokeGetPlayerNames = TInvoke<
    'GET_PLAYER_NAMES',
    void,
    { status: TFileLoaded; result: undefined | string[] }
>;
//#endregion

//#region INSTALLED SONGS
export type TInvokeLoadInstalledSongs = TInvoke<
    'LOAD_INSTALLED_STATS',
    void,
    { status: TFileLoaded }
>;
export type TInvokeIsInstalled = TInvoke<
    'SONG_IS_INSTALLED',
    { mapId: TSongId },
    { result: boolean | undefined; status: TFileLoaded }
>;
export type TInvokeFilterLocalMaps = TInvoke<
    'FILTER_LOCAL_MAPS',
    { q: string | undefined; page: number },
    { count: number; data: ILocalMapInfo[] }
>;
export type TInvokeDeleteSong = TInvoke<'DELETE_SONG', { id: TSongId }, true>;
export type TInvokeGetLocalCover = TInvoke<'GET_LOCAL_COVER', { id: TSongId }, string>;
export type TInvokeMapsCount = TInvoke<'MAPS_COUNT', void, number>;
//#endregion

//#region SETTINGS
export type TInvokeGetSettings = TInvoke<'GET_SETTINGS', void, { result: TSettings }>;

export type TInvokeSetSettings = TInvoke<'SET_SETTINGS', TSettings, { result: TSettings }>;

//#endregion

//#region Install
export type TInvokeInstallSong = TInvoke<
    'INSTALL_SONG',
    { arrayBuffer: ArrayBuffer; mapDetail: TMapDetail; latestVersion: TMapVersion },
    { result: boolean }
>;
//#endregion

//#region CACHE
export type TInvokeWriteCache<DATA> = TInvoke<'WRITE_CACHE', { name: string; data: DATA }, void>;
export type TInvokeReadCache<DATA> = TInvoke<'READ_CACHE', { name: string }, { data: DATA }>;
//#endregion
