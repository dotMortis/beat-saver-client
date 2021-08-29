import { Injectable } from '@angular/core';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    TSendCheckUpdates,
    TSendUpdate,
    TSendUpdateDlProgress,
    TSendUpdateDownlaoded,
    TSendUpdatefound
} from '../../../models/electron/send.channels';
import { ElectronService } from '../root.provided/electron.service';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private _updateStatus?:
        | 'CHECK_UPDATES'
        | 'NO_UPDATE'
        | 'UPDATE_FOUND'
        | 'ERROR'
        | 'UPDATE_DL_PROGRESS'
        | 'UPDATE_DOWNLOADED';
    get updateStatus():
        | 'CHECK_UPDATES'
        | 'NO_UPDATE'
        | 'UPDATE_FOUND'
        | 'ERROR'
        | 'UPDATE_DL_PROGRESS'
        | 'UPDATE_DOWNLOADED'
        | undefined {
        return this._updateStatus;
    }

    private _updateInfo?: UpdateInfo;
    get updateInfo(): UpdateInfo | undefined {
        return this._updateInfo;
    }

    private _updateError?: Error;
    get updateError(): Error | undefined {
        return this._updateError;
    }

    private _downloadProgress?: ProgressInfo;
    get downloadProgress(): ProgressInfo | undefined {
        return this._downloadProgress;
    }

    public onChange: Subject<
        | 'CHECK_UPDATES'
        | 'NO_UPDATE'
        | 'UPDATE_FOUND'
        | 'ERROR'
        | 'UPDATE_DL_PROGRESS'
        | 'UPDATE_DOWNLOADED'
        | undefined
    >;

    constructor(private _eleService: ElectronService) {
        this.onChange = new Subject<
            | 'CHECK_UPDATES'
            | 'NO_UPDATE'
            | 'UPDATE_FOUND'
            | 'ERROR'
            | 'UPDATE_DL_PROGRESS'
            | 'UPDATE_DOWNLOADED'
            | undefined
        >();
        this._onCheckUpdates();
        this._onUpdateFound();
        this._onDlProgress();
        this._onDownloaded();
    }

    updateApp(): void {
        this._eleService.send<TSendUpdate>('UPDATE', undefined);
    }

    private _onCheckUpdates(): void {
        this._eleService
            .on<TSendCheckUpdates>('CHECK_UPDATES')
            .pipe(
                tap(() => {
                    this._updateStatus = 'CHECK_UPDATES';
                    this._updateInfo = this._updateError = undefined;
                    this.onChange.next(this._updateStatus);
                })
            )
            .subscribe();
    }

    private _onUpdateFound(): void {
        this._eleService
            .on<TSendUpdatefound>('UPDATE_FOUND')
            .pipe(
                tap((info: UpdateInfo | Error | null) => {
                    if (!info) {
                        this._updateStatus = 'NO_UPDATE';
                        this._updateInfo = this._updateError = undefined;
                    } else if (info instanceof Error) {
                        this._updateStatus = 'ERROR';
                        this._updateError = info;
                        this._updateInfo = undefined;
                    } else {
                        this._updateStatus = 'UPDATE_FOUND';
                        this._updateError = undefined;
                        this._updateInfo = info;
                    }
                    this.onChange.next(this._updateStatus);
                })
            )
            .subscribe();
    }

    private _onDlProgress(): void {
        this._eleService
            .on<TSendUpdateDlProgress>('UPDATE_DL_PROGRESS')
            .pipe(
                tap((info: ProgressInfo) => {
                    this._updateStatus = 'UPDATE_DL_PROGRESS';
                    this._downloadProgress = info;
                    this.onChange.next(this._updateStatus);
                })
            )
            .subscribe();
    }

    private _onDownloaded(): void {
        this._eleService
            .on<TSendUpdateDownlaoded>('UPDATE_DOWNLOADED')
            .pipe(
                tap((info: UpdateInfo) => {
                    this._updateStatus = 'UPDATE_DOWNLOADED';
                    this._updateInfo = info;
                    this.onChange.next(this._updateStatus);
                })
            )
            .subscribe();
    }
}
