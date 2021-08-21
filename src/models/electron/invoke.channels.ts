import { TSongHash, TSongId } from '../played-songs.model';
import { TLevelStatsInfo } from '../player-data.model';
import { TSettings } from '../settings.model';
import { TFileLoaded } from '../types';

export type TInvoke<CHANNEL extends string, ARGS, RETURN_VALUE> = {
    channel: CHANNEL;
    args: ARGS;
    retrunValue: RETURN_VALUE;
};

//#region PLAYER STATS
export type TInvokeLoadPlayedSongs = TInvoke<'LOAD_PLAYER_STATS', void, { status: TFileLoaded }>;

export type TInvokeGetPlayerSongStats = TInvoke<
    'GET_PLAYER_SONG_STATS',
    { playerName: string; songHash: TSongHash },
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
    { songId: TSongId },
    { result: boolean | undefined; status: TFileLoaded }
>;
//#endregion

//#region SETTINGS
export type TInvokeGetSettings = TInvoke<'GET_SETTINGS', void, { result: TSettings }>;

export type TInvokeSetSettings = TInvoke<'SET_SETTINGS', TSettings, { result: TSettings }>;

//#endregion

//#region Install
export type TInvokeInstallSong = TInvoke<
    'INSTALL_SONG',
    { arrayBuffer: ArrayBuffer; songId: TSongId; songName: string },
    { result: boolean | Error }
>;
//#endregion
