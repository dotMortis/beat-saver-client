import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendDebug, TSendError } from '../../../../models/electron/send.channels';
import { TSettings } from '../../../../models/settings.model';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { InstalledSongsService } from '../../../services/null.provided/installed-songs.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { SettingsService } from '../../../services/root.provided/settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent extends UnsubscribeComponent implements OnInit {
    private _isInit: boolean;

    public dirty: Set<string>;

    private _selectablePlayerNames: { name: string }[];
    set selectablePlayerNames(val: { name: string }[]) {
        this._selectablePlayerNames = val;
    }
    get selectablePlayerNames(): { name: string }[] {
        return this._selectablePlayerNames;
    }

    private _selectedPlayerName?: { name: string };
    set selectedPlayerName(val: { name: string } | undefined) {
        if (this._selectedPlayerName?.name !== val?.name) {
            this._selectedPlayerName = val;
        }
        if (this._isInit && val?.name !== this.playerStatsService.selectedPlayer?.name)
            this.dirty.add('SPN');
        else if (this.dirty.has('SPN')) this.dirty.delete('SPN');
    }
    get selectedPlayerName(): { name: string } | undefined {
        return this._selectedPlayerName;
    }

    private _bsInstallPath: string | undefined;
    get bsInstallPath(): string | undefined {
        return this._bsInstallPath;
    }
    set bsInstallPath(val: string | undefined) {
        if (this._bsInstallPath !== val) {
            this._bsInstallPath = val;
        }
        if (this._isInit && val !== this.optService.settings?.bsInstallPath.value)
            this.dirty.add('BIP');
        else if (this.dirty.has('BIP')) this.dirty.delete('BIP');
    }

    private _bsAppDataPath: string | undefined;
    get bsAppDataPath(): string | undefined {
        return this._bsAppDataPath;
    }
    set bsAppDataPath(val: string | undefined) {
        if (this._bsAppDataPath !== val) {
            this._bsAppDataPath = val;
        }
        if (this._isInit && val !== this.optService.settings?.bsAppDataPath.value)
            this.dirty.add('BADP');
        else if (this.dirty.has('BADP')) this.dirty.delete('BADP');
    }

    private _expandAllSongCards: boolean | undefined;
    get expandAllSongCards(): boolean | undefined {
        return this._expandAllSongCards;
    }
    set expandAllSongCards(val: boolean | undefined) {
        if (this._expandAllSongCards !== val) {
            this._expandAllSongCards = val;
        }
        if (this._isInit && val !== this.optService.settings?.expandAllSongCards.value)
            this.dirty.add('EXPSC');
        else if (this.dirty.has('EXPSC')) this.dirty.delete('EXPSC');
    }

    private _showTour: boolean;
    get showTour(): boolean {
        return this._showTour;
    }
    set showTour(val: boolean) {
        if (this._showTour !== val) {
            this._showTour = val;
            if (!val) {
                window.localStorage.setItem('tour', 'shown');
            } else {
                window.localStorage.removeItem('tour');
            }
        }
    }

    constructor(
        public optService: SettingsService,
        public installedSongsService: InstalledSongsService,
        public playerStatsService: PlayerStatsService,
        private _eleService: ElectronService
    ) {
        super();
        this._showTour = window.localStorage.getItem('tour') == null;
        this._selectablePlayerNames = new Array<{ name: string }>();
        this._isInit = false;
        this.dirty = new Set<string>();
    }

    ngOnInit(): void {
        this.addSub(this._observePlayerNamesChange());
        this.addSub(
            this.optService.visibleChange.pipe(
                mergeMap(async (result: boolean) => {
                    try {
                        if (result) {
                            this._showTour = window.localStorage.getItem('tour') == null;
                            if (this.optService.settings) {
                                this._setValues(this.optService.settings);
                            }
                            await this.playerStatsService.loadPlayerNames().toPromise();
                        }
                    } catch (error) {
                        ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                    } finally {
                        this._isInit = true;
                    }
                })
            )
        );
    }

    async onSave(): Promise<void> {
        try {
            this.optService.setOptUnsaved({
                bsAppDataPath: this.bsAppDataPath,
                bsInstallPath: this.bsInstallPath,
                playerName: this.selectedPlayerName?.name,
                expandAllSongCards: this.expandAllSongCards || false
            });
            const saveResult = await this.optService.saveSettings().catch(error => {
                ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
            });

            if (saveResult) {
                this._setValues(saveResult.result);
                await this.installedSongsService.loadInstalledSongs().catch(error => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                });
                await this.playerStatsService.loadPlayersStats().catch(error => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                });
            }
        } catch (error) {
            ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
        }
    }

    async onReset(): Promise<void> {
        try {
            const result = await this.optService.loadSettings();
            if (result) {
                this._setValues(result.result);
            }
        } catch (error) {
            ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
        }
    }

    private _observePlayerNamesChange(): Observable<string[] | undefined> {
        return this.playerStatsService.playerNamesChange.pipe(
            tap((playerNames: string[] | undefined) => {
                ipcRendererSend<TSendDebug>(this._eleService, 'DEBUG', {
                    msg: 'playerNamesChange',
                    meta: playerNames
                });
                if (playerNames?.length) {
                    this._selectablePlayerNames = new Array(
                        ...playerNames.map((name: string) => ({ name }))
                    );
                } else {
                    this._selectablePlayerNames.length = 0;
                }
            })
        );
    }

    private _setValues(settings: TSettings): void {
        const { bsAppDataPath, bsInstallPath, playerName, expandAllSongCards } = settings;
        this.bsAppDataPath =
            bsAppDataPath.value != null ? bsAppDataPath.value : bsAppDataPath.default;
        this.bsInstallPath =
            bsInstallPath.value != null ? bsInstallPath.value : bsInstallPath.default;
        this.expandAllSongCards =
            expandAllSongCards.value != null
                ? expandAllSongCards.value
                : expandAllSongCards.default;
        const tempPlayerName = playerName.value || playerName.default;
        if (tempPlayerName) {
            this.selectedPlayerName = {
                name: tempPlayerName
            };
            this.playerStatsService.selectedPlayer = {
                name: tempPlayerName
            };
        }
    }
}
