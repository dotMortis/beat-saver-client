import { Injectable, NgZone } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import { Observable, Subscriber } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { TInvoke } from '../../../models/electron/invoke.channels';
import {
    TSend,
    TSendClose,
    TSendError,
    TSendReadyClose
} from '../../../models/electron/send.channels';
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

    constructor(private _notify: NotifyService, private _ngZone: NgZone) {
        if (this.isElectron) {
            this._onCloseQuery = new Array<() => Promise<void>>();
            this._ipcRenderer = window.require('electron').ipcRenderer;
            this._fs = window.require('fs');
            this.on<TSendClose>('ON_CLOSE')
                .pipe(
                    tap(() => {
                        if (this._ipcRenderer) this._close(this._ipcRenderer);
                    })
                )
                .subscribe();
        }
    }

    addOnClose(cb: () => Promise<void>): void {
        this._onCloseQuery?.push(cb);
    }

    async invoke<INVOKE_TYPE extends TInvoke<any, any, any> = never>(
        channel: INVOKE_TYPE['channel'],
        args: INVOKE_TYPE['args']
    ): Promise<INVOKE_TYPE['retrunValue'] | false> {
        return this.ipcRenderer ? this.ipcRenderer.invoke(channel, args) : false;
    }

    send<SEND_TYPE extends TSend<any, any> = never>(
        channel: SEND_TYPE['channel'],
        args: SEND_TYPE['args']
    ): boolean {
        if (this.ipcRenderer) {
            this.ipcRenderer.send(channel, args);
            return true;
        } else return false;
    }

    on<SEND_TYPE extends TSend<any, any> = never>(
        channel: SEND_TYPE['channel']
    ): Observable<SEND_TYPE['args']> {
        return new Observable<SEND_TYPE['args']>((sub: Subscriber<SEND_TYPE['args']>) => {
            this.ipcRenderer?.on(
                channel,
                (event: Electron.IpcRendererEvent, data: SEND_TYPE['args']) => {
                    this._ngZone.run(() => sub.next(data));
                }
            ) || sub.complete();
        });
    }

    private _close(renderer: typeof ipcRenderer): void {
        new Observable<void>((sub: Subscriber<void>) => {
            if (this._onCloseQuery) {
                const promise = Promise.all(
                    this._onCloseQuery?.map(cb =>
                        cb().catch(error => {
                            this._notify.error(error);
                            this.send<TSendError>('ERROR', error);
                        })
                    )
                );
                promise.catch(e => {});
                promise.finally(() => sub.complete());
            } else {
                sub.complete();
            }
        })
            .pipe(finalize(() => this.send<TSendReadyClose>('ON_READY_CLOSE', undefined)))
            .subscribe();
    }
}
