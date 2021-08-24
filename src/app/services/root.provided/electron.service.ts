import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import { Observable, Subscriber } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ipcRendererOn, ipcRendererSend } from '../../../models/electron/electron.register';
import { TSendClose, TSendError, TSendReadyClose } from '../../../models/electron/send.channels';
import { NotifyService } from './notify.service';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    private _onCloseQuery?: Array<() => Promise<void>>;
    private _ipcRenderer?: typeof ipcRenderer;
    private _fs?: typeof fs;

    get ipcRenderer(): typeof ipcRenderer | undefined {
        return this._ipcRenderer;
    }

    get fs(): typeof fs | undefined {
        return this._fs;
    }

    get isElectron(): boolean {
        return !!(window && window.process && window.process.type);
    }

    constructor(private _notify: NotifyService) {
        if (this.isElectron) {
            this._onCloseQuery = new Array<() => Promise<void>>();
            this._ipcRenderer = window.require('electron').ipcRenderer;
            this._fs = window.require('fs');
            ipcRendererOn<TSendClose>(this, 'ON_CLOSE', () => {
                if (this._ipcRenderer) this._close(this._ipcRenderer);
            });
        }
    }

    addOnClose(cb: () => Promise<void>): void {
        this._onCloseQuery?.push(cb);
    }

    private _close(renderer: typeof ipcRenderer): void {
        new Observable<void>((sub: Subscriber<void>) => {
            if (this._onCloseQuery) {
                const promise = Promise.all(
                    this._onCloseQuery?.map(cb =>
                        cb().catch(error => {
                            this._notify.error(error);
                            ipcRendererSend<TSendError>(this, 'ERROR', error);
                        })
                    )
                );
                promise.catch(e => {});
                promise.finally(() => sub.complete());
            } else {
                sub.complete();
            }
        })
            .pipe(
                finalize(() => ipcRendererSend<TSendReadyClose>(this, 'ON_READY_CLOSE', undefined))
            )
            .subscribe();
    }
}
