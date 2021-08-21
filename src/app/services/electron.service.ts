import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
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

    constructor() {
        if (this.isElectron) {
            this._ipcRenderer = window.require('electron').ipcRenderer;
            this._fs = window.require('fs');
        }
    }
}
