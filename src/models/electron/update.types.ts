import { ProgressInfo } from 'electron-updater';

export type TUpdateProgress = {
    progress: ProgressInfo;
    bytesPerSeconds: number;
    percent: number;
    total: number;
    transferred: number;
};
