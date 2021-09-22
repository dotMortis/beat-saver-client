import { TMapDetail, TMapVersion } from '../api/api.models';

export type TSongDownloadInfo = {
    mapDetail: TMapDetail;
    latestVersion: TMapVersion;
    download: number;
    installed: { status: TInstalled };
    error?: Error;
};

export type TInstalled = 'INSTALLING' | 'INSTALLED' | false;
