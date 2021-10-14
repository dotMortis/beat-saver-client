import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TInvokeGetSettings, TInvokeSetSettings } from '../../../models/electron/invoke.channels';
import { TSettings } from '../../../models/settings.model';
import { ElectronService } from './electron.service';
import { NotifyService } from './notify.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    //#region visible
    private _visible: boolean;
    set visible(val: boolean) {
        if (this._visible !== val) {
            if (
                !val &&
                (!this.settings?.bsInstallPath.value ||
                    this.settings?.bsInstallPath.error ||
                    !this.settings?.bsAppDataPath.value ||
                    this.settings?.bsAppDataPath.error)
            ) {
                return;
            }
            this._visible = val;
            this.visibleChange.next(val);
        }
    }
    get visible(): boolean {
        return this._visible;
    }
    visibleChange: BehaviorSubject<boolean>;
    //#endregion

    //#region settings
    private _settings?: TSettings;
    get settings(): TSettings | undefined {
        return this._settings;
    }
    settingsChange: BehaviorSubject<TSettings | undefined>;
    //#endregion

    get settingsComplete(): boolean {
        return this._settings?.bsAppDataPath?.value &&
            this._settings?.bsInstallPath?.value &&
            this._settings?.playerName?.value
            ? true
            : false;
    }

    constructor(public eleService: ElectronService, private _notify: NotifyService) {
        this._visible = false;
        this.visibleChange = new BehaviorSubject<boolean>(false);
        this.settingsChange = new BehaviorSubject<TSettings | undefined>(undefined);
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
            const result = await this.eleService.invoke<TInvokeSetSettings>(
                'SET_SETTINGS',
                this._settings
            );
            if (result instanceof Error) {
                this._notify.error({ title: 'Settings Save Error', error: result });
                throw result;
            } else if (result) {
                this._settings = result.result;
                this.settingsChange.next(this._settings);
                return result;
            }
        }
        return false;
    }

    async loadSettings(): Promise<{ result: TSettings } | false> {
        const settings = await this.eleService.invoke<TInvokeGetSettings>(
            'GET_SETTINGS',
            undefined
        );
        if (settings instanceof Error) {
            this._notify.error({ title: 'Settings Load Error', error: settings });
            throw settings;
        } else if (settings) {
            this._settings = settings.result;
            this.settingsChange.next(this._settings);
        }
        return settings;
    }
}
