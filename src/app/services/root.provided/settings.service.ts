import { EventEmitter, Injectable } from '@angular/core';
import { ipcRendererInvoke } from '../../../models/electron/electron.register';
import { TInvokeGetSettings, TInvokeSetSettings } from '../../../models/electron/invoke.channels';
import { TSettings } from '../../../models/settings.model';
import { ElectronService } from './electron.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    //#region visible
    private _visible: boolean;
    set visible(val: boolean) {
        if (this._visible !== val) {
            this._visible = val;
            this.visibleChange.next(val);
        }
    }
    get visible(): boolean {
        return this._visible;
    }
    visibleChange: EventEmitter<boolean>;
    //#endregion

    //#region settings
    private _settings?: TSettings;
    get settings(): TSettings | undefined {
        return this._settings;
    }
    settingsChange: EventEmitter<TSettings>;
    //#endregion

    get settingsComplete(): boolean {
        return this._settings?.bsAppDataPath?.value &&
            this._settings?.bsInstallPath?.value &&
            this._settings?.playerName?.value
            ? true
            : false;
    }

    constructor(public eleService: ElectronService) {
        this._visible = false;
        this.visibleChange = new EventEmitter<boolean>();
        this.settingsChange = new EventEmitter<TSettings>();
    }

    setOptUnsaved(vals: { [P in keyof TSettings]: TSettings[P]['value'] }): void {
        if (this._settings) {
            for (const key of Object.keys(vals)) {
                const typedKey = <keyof TSettings>key;
                this._settings[typedKey].value = vals[typedKey];
            }
            this.settingsChange.next(this._settings);
        }
    }

    async saveSettings(): Promise<{ result: TSettings } | false> {
        if (this._settings) {
            const result = await ipcRendererInvoke<TInvokeSetSettings>(
                this.eleService,
                'SET_SETTINGS',
                this._settings
            );
            if (result) {
                this._settings = result.result;
                this.settingsChange.next(this._settings);
                return result;
            }
        }
        return false;
    }

    async loadSettings(): Promise<{ result: TSettings } | false> {
        const settings = await ipcRendererInvoke<TInvokeGetSettings>(
            this.eleService,
            'GET_SETTINGS',
            undefined
        );
        if (settings) {
            this._settings = settings.result;
            this.settingsChange.next(this._settings);
        }
        return settings;
    }
}
