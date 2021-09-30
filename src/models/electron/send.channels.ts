import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { TSongId } from '../maps/map-ids.model';

export type TSend<CHANNEL extends string, ARGS> = {
    channel: CHANNEL;
    args: ARGS;
};

//#region LOGGING
export type TSendDebug = TSend<'DEBUG', { msg: string; meta?: any }>;
export type TSendInfo = TSend<'INFO', { msg: string; meta?: any }>;
export type TSendError = TSend<'ERROR', string | Error>;
//#endregion

//#region BrowserDownload
export type TSendBrowserDownload = TSend<'DOWNLOAD', TDownloadItemInfo>;
export type TSendBrowserDownloadAction = TSend<'DOWNLOAD_ACTION', TDownloadActionInfo>;

export type TDownloadItemInfo = {
    event: 'update' | 'done';
    state: 'interrupted' | 'progressing' | 'completed' | 'cancelled';
    isPaused: boolean;
    progress: number;
    filename: string;
    id: string;
};
export type TDownloadActionInfo = {
    action: 'resume' | 'cancel' | 'pause';
    id: string;
};
//#endregion

//#region CLOSE
export type TSendClose = TSend<'ON_CLOSE', void>;
export type TSendReadyClose = TSend<'ON_READY_CLOSE', void>;
//#endregion

//#region LOADING
export type TSendReady = TSend<'READY', void>;
//#endregion

//#region Updater
export type TSendCheckUpdates = TSend<'CHECK_UPDATES', void>;
export type TSendUpdatefound = TSend<'UPDATE_FOUND', UpdateInfo | Error | null>;
export type TSendUpdateDlProgress = TSend<'UPDATE_DL_PROGRESS', ProgressInfo>;
export type TSendUpdateDownlaoded = TSend<'UPDATE_DOWNLOADED', UpdateInfo>;
export type TSendUpdate = TSend<'UPDATE', void>;
//#endregion

//#region local maps sync
export type TSendMapSyncStatus = TSend<'MAP_SYNC_STATUS', TMapSyncStatus>;
export type TMapSyncStatus = {
    status: 'SYNCING' | 'FINISH' | 'ERROR';
    error?: Error;
    currentCount: number;
    sum: number;
};
export type TSendMapsCount = TSend<'MAPS_COUNT', number>;
export type TSendMapInstallChange = TSend<
    'MAP_INSTALL_CHANGED',
    { songId: TSongId; installed: boolean }
>;
//#endregion
