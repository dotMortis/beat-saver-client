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
