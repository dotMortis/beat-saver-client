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
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';

export const getSettingsHandle = IpcHelerps.ipcMainHandle<TInvokeGetSettings>(
    'GET_SETTINGS',
    async (event: Electron.IpcMainInvokeEvent, args: void) => {
        try {
            return { result: settings.getOpts() };
        } catch (error: any) {
            return error;
        }
    }
);

export const setSettingsHandle = IpcHelerps.ipcMainHandle<TInvokeSetSettings>(
    'SET_SETTINGS',
    async (event: Electron.IpcMainInvokeEvent, args: TSettings) => {
        try {
            return { result: settings.setOpts(args) };
        } catch (error: any) {
            return error;
        }
    }
);

class Settings extends CommonLoader {
    private _settings: TSettings;
    private _fullPath: string;
    private _folderPath: string;

    constructor() {
        super();
        this._folderPath = path.join(app.getPath('appData'), app.getName());
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
                nullable: true,
                default: false
            },
            beatSaverPaginated: {
                value: true,
                check: 'NONE',
                type: 'ANY',
                nullable: true,
                default: true
            },
            localsPaginated: {
                value: true,
                check: 'NONE',
                type: 'ANY',
                nullable: true,
                default: true
            },
            mapperPaginated: {
                value: true,
                check: 'NONE',
                type: 'ANY',
                nullable: true,
                default: true
            }
        };
        this._settings = this._loadSettings(this._settings);
    }

    setOpts(value: TSettings): TSettings {
        this._settings = value;
        this._settings.bsAppDataPath.value = this._settings.bsAppDataPath?.value?.trim();
        this._settings.bsInstallPath.value = this._settings.bsInstallPath?.value?.trim();
        if (!this.validateOpts()) return this._settings;
        this._writeSettings(this._settings);
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

    private _loadSettings(settings: TSettings): TSettings {
        const settingsClone = this._clone(settings);
        try {
            const fileBuffer = readFileSync(this._fullPath);
            const savedSettings = JSON.parse(fileBuffer.toString());
            for (const key of Object.keys(savedSettings)) {
                const typedKey = <keyof TSettings>key;
                if (settingsClone[typedKey]) {
                    settingsClone[typedKey].value = savedSettings[typedKey].value;
                }
            }
            return this.validateOpts() ? settingsClone : settings;
        } catch {
            this._writeSettings(settings);
            return settings;
        }
    }

    private _writeSettings(settings: TSettings): void {
        const saveData: any = {};
        for (const key of Object.keys(settings)) {
            const typedKey = <keyof TSettings>key;
            saveData[typedKey] = {
                value: settings[typedKey].value
            };
        }
        mkdirSync(this._folderPath, { recursive: true });
        writeFileSync(this._fullPath, JSON.stringify(saveData), { flag: 'w' });
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
                } catch (error: any) {
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
                } catch (error: any) {
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

    private _clone<T>(settings: T): T {
        if (settings instanceof Array) {
            return <any>settings.map((val: any) => this._clone(val));
        } else if (!(settings instanceof Object)) {
            return settings;
        }
        const clone: T = <T>{};
        Object.keys(settings).forEach((key: string) => {
            const typedKey = <keyof T>key;
            const tempValue = settings[typedKey];
            if (tempValue instanceof Array) {
                clone[typedKey] = <typeof tempValue>tempValue.map((val: any) => this._clone(val));
            } else if (tempValue instanceof Object) {
                clone[typedKey] = this._clone(tempValue);
            } else {
                clone[typedKey] = tempValue;
            }
        });
        return clone;
    }
}

export const settings = new Settings();
export default settings;
