import { app } from 'electron';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TInvokeReadCache, TInvokeWriteCache } from '../../src/models/electron/invoke.channels';
import { IpcHelerps } from '../models/helpers/ipc-main.register';

export const writeCahceHandle = IpcHelerps.ipcMainHandle<TInvokeWriteCache<any>>(
    'WRITE_CACHE',
    async (event: Electron.IpcMainInvokeEvent, args: { name: string; data: any }) => {
        try {
            return chacheLoader.writeCache(args.name, args.data);
        } catch (error) {
            return error;
        }
    }
);

export const readCahceHandle = IpcHelerps.ipcMainHandle<TInvokeReadCache<any>>(
    'READ_CACHE',
    async (event: Electron.IpcMainInvokeEvent, args: { name: string }) => {
        try {
            return { data: chacheLoader.readCache(args.name) };
        } catch (error) {
            return error;
        }
    }
);

class CacheLoader {
    public readonly path: string;
    public readonly cacheFolderName: string;

    constructor() {
        this.cacheFolderName = 'app-cache';
        this.path = join(app.getPath('cache'), app.getName(), this.cacheFolderName);
        this._ensureFolder();
    }

    writeCache(name: string, data: any): void {
        this._writeFile(this._getFileName(name), JSON.stringify(data));
    }

    readCache(name: string): any {
        try {
            const dataBuffer = readFileSync(join(this.path, this._getFileName(name)));
            return JSON.parse(dataBuffer.toString());
        } catch {
            return undefined;
        }
    }

    private _getFileName(name: string): string {
        return `_${name.toLowerCase()}`;
    }

    private _writeFile(filename: string, data: string): void {
        writeFileSync(join(this.path, filename), data);
    }

    private _ensureFolder(): void {
        if (!existsSync(this.path)) {
            mkdirSync(this.path, { recursive: true });
        }
    }
}

export const chacheLoader = new CacheLoader();
