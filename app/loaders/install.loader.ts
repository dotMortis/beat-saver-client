import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as JSZip from 'jszip';
import * as path from 'path';
import { TInvokeInstallSong } from '../../src/models/electron/invoke.channels';
import { TSongId } from '../../src/models/played-songs.model';
import { IpcHelerps } from '../models/helpers/ipc-main.register';
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
                const content = await file.async('nodebuffer');
                this._saveFile(subFolder, file.name, content);
            }
            return { result: true };
        } catch (error) {
            return { result: error };
        }
    }

    private _saveFile(folderName: string, filename: string, buffer: Buffer) {
        const folderPath = path.join(this._filePath, folderName);
        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }
        writeFileSync(path.join(folderPath, filename), buffer, { flag: 'w' });
    }
}

export const install = new Install();
