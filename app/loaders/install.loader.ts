import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as JSZip from 'jszip';
import * as path from 'path';
import { sep } from 'path';
import { TInvokeInstallSong } from '../../src/models/electron/invoke.channels';
import { TSongId } from '../../src/models/played-songs.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import { sanitize } from '../models/helpers/sanitize.model';
import { settings } from './settings.loader';

export const installSongHandle = IpcHelerps.ipcMainHandle<TInvokeInstallSong>(
    'INSTALL_SONG',
    async (
        event: Electron.IpcMainInvokeEvent,
        args: { arrayBuffer: ArrayBuffer; songId: TSongId; songName: string }
    ) => {
        return install.installSong(args);
    }
);

class Install {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsInstallPath.value;
        if (!tempPath) {
            throw new Error('Missing BS install path');
        } else if (!existsSync(tempPath)) {
            throw new Error('Invalid BS install path');
        } else {
            return path.join(tempPath, 'Beat Saber_Data', 'CustomLevels');
        }
    }

    constructor() {}

    async installSong(info: { arrayBuffer: ArrayBuffer; songId: TSongId; songName: string }) {
        try {
            const zip = await JSZip.loadAsync(info.arrayBuffer);

            const subFolder = sanitize(`${info.songId} (${info.songName})`);
            for (const filename of Object.keys(zip.files)) {
                const file = zip.files[filename];
                if (file.name.endsWith(sep)) {
                    this._createFolder(subFolder, file.name);
                } else {
                    const content = await file.async('nodebuffer');
                    this._saveFile(subFolder, file.name, content);
                }
            }
            return { result: true };
        } catch (error) {
            return { result: error };
        }
    }

    private _saveFile(folderName: string, filename: string, buffer: Buffer): void {
        const folderPath = this._getFolderPath(folderName);
        this._createFolder(folderName);
        writeFileSync(path.join(folderPath, filename), buffer, { flag: 'w' });
    }

    private _createFolder(...folderNames: string[]): void {
        const folderPath = this._getFolderPath(...folderNames);
        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }
    }

    private _getFolderPath(...folderNames: string[]): string {
        return path.join(this._filePath, ...folderNames);
    }
}

export const install = new Install();
