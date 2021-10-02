import { HttpEvent, HttpEventType } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, mergeMap, takeWhile, tap } from 'rxjs/operators';
import { TMapDetail, TMapVersion } from '../../../models/api/api.models';
import { TInstalled, TSongDownloadInfo } from '../../../models/electron/download.model';
import {
    TInvokeDeleteSong,
    TInvokeInstallSong,
    TInvokeReadCache,
    TInvokeWriteCache
} from '../../../models/electron/invoke.channels';
import { TSendError } from '../../../models/electron/send.channels';
import { TSongHash, TSongId } from '../../../models/maps/map-ids.model';
import { ElectronService } from '../root.provided/electron.service';
import { ApiService } from './api.service';
import { LocalMapsService } from './local-maps.service';

@Injectable({
    providedIn: null
})
export class DlService {
    private _activeInstallations: number;
    private _activeDownloads: number;
    //#region visible
    private _visible: boolean;
    set visible(val: boolean) {
        if (this._visible !== val) {
            this._visible = val;
            this.visibleChange.next(val);
        }
    }
    get visible(): boolean {
        return this._visible;
    }
    visibleChange: EventEmitter<boolean>;
    //#endregion

    private _dlList: Map<TSongHash, TSongDownloadInfo>;

    get dlArray(): Array<TSongDownloadInfo> {
        return Array.from(this._dlList.values());
    }

    get dlSize(): number {
        return this._dlList.size;
    }

    get dlSizeInstalled(): number {
        let z = 0;
        for (const [hash, item] of this._dlList) {
            if (item.installed.status === 'INSTALLED') z++;
        }
        return z;
    }

    private _downloadFinished: Subject<{
        blob?: Blob;
        error?: Error;
        info: TSongDownloadInfo;
    }>;

    constructor(
        private _apiService: ApiService,
        private _eleService: ElectronService,
        private _installedSongsService: LocalMapsService
    ) {
        this._downloadFinished = new Subject<{
            blob?: Blob;
            error?: Error;
            info: TSongDownloadInfo;
        }>();
        this._dlList = new Map<TSongHash, TSongDownloadInfo>();
        this._visible = false;
        this.visibleChange = new EventEmitter<boolean>();
        this._activeInstallations = this._activeDownloads = 0;
        this._handleQueueCache();
    }

    add(
        mapDetail: TMapDetail,
        latestVersion: TMapVersion,
        installed: { status: TInstalled }
    ): TSongDownloadInfo {
        if (!this._dlList.has(latestVersion.hash)) {
            const dlInfo: TSongDownloadInfo = {
                mapDetail,
                latestVersion,
                download: 0,
                installed
            };
            this._dlList.set(latestVersion.hash, dlInfo);
            return dlInfo;
        }
        return <TSongDownloadInfo>this._dlList.get(latestVersion.hash);
    }

    remove(latestVersion: TMapVersion): void {
        if (this._dlList.has(latestVersion.hash)) {
            this._dlList.delete(latestVersion.hash);
        }
    }

    clear(): void {
        this._dlList.clear();
    }

    clearInstalled(): void {
        for (const [hash, item] of this._dlList) {
            if (item.installed.status === 'INSTALLED') this._dlList.delete(hash);
        }
    }

    has(latestVersion: TMapVersion): boolean {
        return this._dlList.has(latestVersion.hash);
    }

    filtered(q: string): Array<TSongDownloadInfo> {
        q = q.toLowerCase();
        return Array.from(this._dlList.values()).filter(item =>
            item.mapDetail.name.toLowerCase().includes(q)
        );
    }

    deleteSingle(id: TSongId): Promise<boolean | Error> {
        return this._eleService.invoke<TInvokeDeleteSong>('DELETE_SONG', { id });
    }

    installSingle(info: TSongDownloadInfo): Promise<void> {
        return new Promise<void>(async (res, rej) => {
            try {
                this._resetErrors();
                this._downloadFinished
                    .pipe(
                        mergeMap(async result => {
                            if (
                                result.info.latestVersion.hash === info.latestVersion.hash &&
                                result.blob &&
                                !result.error
                            ) {
                                await this._installSong(result.blob, result.info);
                            }
                            if (result.info.latestVersion.hash === info.latestVersion.hash) {
                                if (!result.info.error) {
                                    this.remove(result.info.latestVersion);
                                }
                                return true;
                            }
                            return false;
                        }),
                        takeWhile((result: boolean) => !result)
                    )
                    .subscribe()
                    .add(() => res());
                this._downloadSong(info);
            } catch (error) {
                rej(error);
            }
        });
    }

    installAll(): Promise<void> {
        this._activeInstallations = 0;
        let hasMore = true;
        return new Promise<void>(async (res, rej) => {
            try {
                this._resetErrors();
                this._downloadFinished
                    .pipe(
                        mergeMap(async result => {
                            if (hasMore) hasMore = downloadMore();
                            if (result.blob && !result.error) {
                                await this._installSong(result.blob, result.info);
                            }
                        }),
                        takeWhile(
                            () =>
                                hasMore ||
                                this._activeInstallations > 0 ||
                                this._activeDownloads > 0
                        )
                    )
                    .subscribe()
                    .add(() => res());

                this._activeDownloads = 0;
                const downloadMore = (): boolean => {
                    const dlSize = this.dlSize;
                    let z = 0;
                    for (const [hash, item] of this._dlList) {
                        try {
                            if (item.download) {
                                z++;
                                continue;
                            }
                            if (this._activeDownloads > 3) break;
                            z++;
                            this._downloadSong(item);
                        } catch (error: any) {
                            this._eleService.send<TSendError>('ERROR', error);
                        }
                    }
                    return z < dlSize;
                };
                downloadMore();
            } catch (error) {
                rej(error);
            }
        });
    }

    private _downloadSong(info: TSongDownloadInfo): void {
        this._activeDownloads++;
        const sub = this._apiService
            .downloadZip(info.latestVersion.downloadURL)
            .pipe(
                tap((result: HttpEvent<Blob>) => {
                    if (result.type === HttpEventType.DownloadProgress) {
                        info.download = Math.round((100 * result.loaded) / (result.total || 1));
                    }
                    if (result.type === HttpEventType.Response) {
                        this._activeDownloads--;
                        this._downloadFinished.next({ blob: result.body || undefined, info });
                    }
                }),
                catchError(error => {
                    info.error = error;
                    this._activeDownloads--;
                    this._downloadFinished.next({ error, info });
                    return EMPTY;
                }),
                finalize(() => {
                    sub.unsubscribe();
                })
            )
            .subscribe();
    }

    private async _installSong(blob: Blob, info: TSongDownloadInfo): Promise<void> {
        try {
            this._activeInstallations++;
            info.installed.status = 'INSTALLING';
            const arrayBuffer = await blob.arrayBuffer();
            const result = await this._eleService.invoke<TInvokeInstallSong>('INSTALL_SONG', {
                arrayBuffer,
                mapDetail: info.mapDetail,
                latestVersion: info.latestVersion
            });
            if (result instanceof Error) {
                info.error = result;
                info.installed.status = false;
            } else {
                info.installed.status = 'INSTALLED';
            }
        } catch (error: any) {
            info.error = error;
        } finally {
            this._activeInstallations--;
        }
    }

    private _resetErrors(): void {
        for (const [hash, item] of this._dlList) {
            if (item.error) {
                item.error = undefined;
                item.download = 0;
                item.installed.status = false;
            }
        }
    }

    private _handleQueueCache(): void {
        this._eleService.addOnClose(async () => {
            this.clearInstalled();
            await this._eleService.invoke<TInvokeWriteCache<Array<[TSongHash, TSongDownloadInfo]>>>(
                'WRITE_CACHE',
                {
                    name: 'dl_queue',
                    data: Array.from(this._dlList)
                }
            );
        });
        this._eleService
            .invoke<TInvokeReadCache<Array<[TSongHash, TSongDownloadInfo]>>>('READ_CACHE', {
                name: 'dl_queue'
            })
            .then((result: false | Error | { data: Array<[TSongHash, TSongDownloadInfo]> }) => {
                if (result && !(result instanceof Error)) {
                    for (const info of result.data || []) {
                        this._dlList.set(info[0], info[1]);
                    }
                } else if (result instanceof Error) {
                    this._eleService.send<TSendError>('ERROR', result);
                }
            })
            .catch(error => this._eleService.send<TSendError>('ERROR', error));
    }
}
