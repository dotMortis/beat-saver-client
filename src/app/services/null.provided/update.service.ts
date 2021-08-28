import { Injectable } from '@angular/core';
import { UpdateInfo } from 'electron-updater';
import { Subject } from 'rxjs';
import { ipcRendererOn, ipcRendererSend } from '../../../models/electron/electron.register';
import {
    TSendCheckUpdates,
    TSendUpdate,
    TSendUpdateDlProgress,
    TSendUpdateDownlaoded,
    TSendUpdatefound
} from '../../../models/electron/send.channels';
import { TUpdateProgress } from '../../../models/electron/update.types';
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

    private _downloadProgress?: TUpdateProgress;
    get downloadProgress(): TUpdateProgress | undefined {
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
        ipcRendererSend<TSendUpdate>(this._eleService, 'UPDATE', undefined);
    }

    private _onCheckUpdates(): void {
        ipcRendererOn<TSendCheckUpdates>(this._eleService, 'CHECK_UPDATES', () => {
            console.log('CHECK_UPDATES');
            this._updateStatus = 'CHECK_UPDATES';
            this._updateInfo = this._updateError = undefined;
            this.onChange.next(this._updateStatus);
        });
    }

    private _onUpdateFound(): void {
        ipcRendererOn<TSendUpdatefound>(
            this._eleService,
            'UPDATE_FOUND',
            (event: Electron.IpcRendererEvent, info: UpdateInfo | Error | null) => {
                console.log('UPDATE_FOUND', info);
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
            }
        );
    }

    private _onDlProgress(): void {
        ipcRendererOn<TSendUpdateDlProgress>(
            this._eleService,
            'UPDATE_DL_PROGRESS',
            (event: Electron.IpcRendererEvent, info: TUpdateProgress) => {
                console.log('UPDATE_DL_PROGRESS', info);
                this._updateStatus = 'UPDATE_DL_PROGRESS';
                this._downloadProgress = info;
                this.onChange.next(this._updateStatus);
            }
        );
    }

    private _onDownloaded(): void {
        ipcRendererOn<TSendUpdateDownlaoded>(
            this._eleService,
            'UPDATE_DOWNLOADED',
            (event: Electron.IpcRendererEvent, info: UpdateInfo) => {
                console.log('UPDATE_DOWNLOADED', info);
                this._updateStatus = 'UPDATE_DOWNLOADED';
                this._updateInfo = info;
                this.onChange.next(this._updateStatus);
            }
        );
    }
}
