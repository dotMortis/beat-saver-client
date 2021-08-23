import { app } from 'electron';
import {
    closeSync,
    existsSync,
    mkdirSync,
    openSync,
    readFileSync,
    utimesSync,
    writeFileSync
} from 'fs';
import * as path from 'path';
import { TInvokeGetSettings, TInvokeSetSettings } from '../../src/models/electron/invoke.channels';
import { TSettingCheck, TSettings, TSettingType } from '../../src/models/settings.model';
import { IpcHelerps } from '../models/helpers/ipc-main.register';

export const getSettingsHandle = IpcHelerps.ipcMainHandle<TInvokeGetSettings>(
    'GET_SETTINGS',
    async (event: Electron.IpcMainInvokeEvent, args: void) => {
        return { result: settings.getOpts() };
    }
);

export const setSettingsHandle = IpcHelerps.ipcMainHandle<TInvokeSetSettings>(
    'SET_SETTINGS',
    async (event: Electron.IpcMainInvokeEvent, args: TSettings) => {
        return { result: settings.setOpts(args) };
    }
);

class Settings {
    private _settings: TSettings;
    private _fullPath: string;
    private _folderPath: string;

    constructor() {
        this._folderPath = path.join(app.getPath('appData'), 'beat-saver-ui');
        this._fullPath = path.join(this._folderPath, 'settings.json');
        this._settings = {
            bsAppDataPath: {
                value: path.join(
                    process.env.USERPROFILE || '',
                    'AppData',
                    'LocalLow',
                    'Hyperbolic Magnetism',
                    'Beat Saber'
                ),
                check: 'EXIST',
                type: 'FODLER',
                nullable: true,
                default: undefined
            },
            bsInstallPath: {
                value: undefined,
                check: 'EXIST',
                type: 'FODLER',
                nullable: true,
                default: undefined
            },
            playerName: {
                value: undefined,
                check: 'NONE',
                type: 'ANY',
                nullable: true,
                default: undefined
            },
            expandAllSongCards: {
                value: false,
                check: 'NONE',
                type: 'ANY',
                nullable: false,
                default: false
            }
        };
        try {
            const fileBuffer = readFileSync(this._fullPath);
            const savedSettings = JSON.parse(fileBuffer.toString());
            Object.assign(this._settings, savedSettings);
            this.validateOpts();
        } catch {
            mkdirSync(this._folderPath, { recursive: true });
            writeFileSync(this._fullPath, JSON.stringify(this._settings), { flag: 'w' });
            this.validateOpts();
        }
    }

    setOpts(value: TSettings): TSettings {
        this._settings = value;
        this._settings.bsAppDataPath.value = this._settings.bsAppDataPath?.value?.trim();
        this._settings.bsInstallPath.value = this._settings.bsInstallPath?.value?.trim();
        if (!this.validateOpts()) return this._settings;
        writeFileSync(this._fullPath, JSON.stringify(this._settings), { flag: 'w' });
        return this._settings;
    }

    getOpts(): TSettings {
        return this._settings;
    }

    validateOpts(): boolean {
        let result = true;
        for (const key of Object.keys(this._settings)) {
            const opts = this._settings[<keyof TSettings>key];
            const check = <TSettingCheck>opts.check;
            const type = <TSettingType>opts.type;
            opts.error = this._check(check, type, opts.nullable, opts.value);
            if (opts.error) result = false;
        }
        return result;
    }

    private _check(
        check: TSettingCheck,
        type: TSettingType,
        nullable: boolean,
        value: any
    ): string | undefined {
        if (nullable && !value) return undefined;
        else if (!value) return 'Value required';
        if (type === 'FILE') {
            const fileExists = existsSync(value);
            if (fileExists) return undefined;
            else if (check === 'EXIST') return 'File not found';
            else {
                try {
                    this._touch(value);
                    return undefined;
                } catch (error) {
                    return error.name;
                }
            }
        } else if (type === 'FODLER') {
            const folderExists = existsSync(value);
            if (folderExists) return undefined;
            else if (check === 'EXIST') return 'Folder not found';
            else {
                try {
                    mkdirSync(this._folderPath, { recursive: true });
                    return undefined;
                } catch (error) {
                    return error.name;
                }
            }
        }
        return undefined;
    }

    private _touch(file: string) {
        const time = new Date();
        try {
            utimesSync(file, time, time);
        } catch (err) {
            closeSync(openSync(file, 'w'));
        }
    }
}

export const settings = new Settings();
