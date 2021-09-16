import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap, reduce, takeWhile } from 'rxjs/operators';
import { v4 } from 'uuid';
import { TFileLoaded } from '../../../models/electron/file-loaded.model';
import {
    TInvokeGetPlayerNames,
    TInvokeGetPlayerSongStats,
    TInvokeLoadPlayedSongs
} from '../../../models/electron/invoke.channels';
import { TSendDebug } from '../../../models/electron/send.channels';
import { TSongHash } from '../../../models/maps/map-ids.model';
import { TLevelStatsInfo } from '../../../models/player/player-data.model';
import { ElectronService } from '../root.provided/electron.service';
import { NotifyService } from '../root.provided/notify.service';

@Injectable({
    providedIn: null
})
export class PlayerStatsService {
    private _playerNamesLoaded: boolean;
    private _playerNamesLoading: BehaviorSubject<
        boolean | { result: string[] | undefined; status: TFileLoaded }
    >;

    //#region selectedPlayer
    private _selectedPlayer: BehaviorSubject<{ name: string } | undefined>;
    set selectedPlayer(val: { name: string } | undefined) {
        if (this._selectedPlayer.getValue()?.name !== val?.name) {
            this._selectedPlayer.next(val);
            this.selectedPlayerChange.next(val);
        }
    }
    get selectedPlayer(): { name: string } | undefined {
        return this._selectedPlayer.getValue();
    }
    get selectedPlayerSubject(): BehaviorSubject<{ name: string } | undefined> {
        return this._selectedPlayer;
    }
    public selectedPlayerChange: EventEmitter<{ name: string } | undefined>;
    //#endregion

    //#region playerNames
    private _playerNames?: string[];
    get playerNames(): string[] | undefined {
        return this._playerNames;
    }
    set playerNames(val: string[] | undefined) {
        this._playerNames = val;
        this.playerNamesChange.next(this._playerNames);
    }
    public playerNamesChange: EventEmitter<string[] | undefined>;
    //#endregion

    public playerStatsReloaded: EventEmitter<void>;

    constructor(private _eleService: ElectronService, private _notify: NotifyService) {
        this.selectedPlayerChange = new EventEmitter<{ name: string } | undefined>();
        this.playerNamesChange = new EventEmitter<string[] | undefined>();
        this.playerStatsReloaded = new EventEmitter<void>();
        this._playerNamesLoaded = false;
        this._playerNamesLoading = new BehaviorSubject<
            boolean | { result: string[] | undefined; status: TFileLoaded }
        >(false);
        this._selectedPlayer = new BehaviorSubject<{ name: string } | undefined>(undefined);
    }

    loadPlayerSongStats(
        songHash: TSongHash
    ): Observable<false | { status: TFileLoaded; result: TLevelStatsInfo | undefined }> {
        try {
            return this.selectedPlayerSubject.pipe(
                mergeMap(async (selectedPlayer: { name: string } | undefined) => {
                    if (!selectedPlayer) {
                        const result = await this.loadPlayerNames().toPromise();
                        return result === false ? false : undefined;
                    } else {
                        const result = await this._eleService.invoke<TInvokeGetPlayerSongStats>(
                            'GET_PLAYER_SONG_STATS',
                            { playerName: selectedPlayer.name, mapHash: songHash }
                        );
                        this._notify.errorFileHandle(result, 'BS AppData');
                        return result;
                    }
                }),
                takeWhile(result => result == null, true),
                reduce(
                    (
                        acc: false | { status: TFileLoaded; result: TLevelStatsInfo | undefined },
                        val:
                            | false
                            | { status: TFileLoaded; result: TLevelStatsInfo | undefined }
                            | undefined
                    ) => {
                        if (val != null) acc = val;
                        return acc;
                    },
                    false
                )
            );
        } catch (error) {
            throw error;
        }
    }

    loadPlayerNames(): Observable<false | { result: string[] | undefined; status: TFileLoaded }> {
        const v = v4();
        this._eleService.send<TSendDebug>('DEBUG', {
            msg: `loadPlayerNames INIT V: ${v}`
        });
        let loadPlayerNames = true;
        return this._playerNamesLoading.pipe(
            mergeMap(
                async (result: boolean | { result: string[] | undefined; status: TFileLoaded }) => {
                    if (result !== true) {
                        if (!loadPlayerNames) return result;
                        try {
                            this._playerNamesLoading.next(true);
                            const ipcResult = await this._eleService.invoke<TInvokeGetPlayerNames>(
                                'GET_PLAYER_NAMES',
                                undefined
                            );
                            if (ipcResult !== false && ipcResult.result instanceof Array) {
                                this.playerNames = ipcResult.result;
                                this.selectedPlayer = { name: this.playerNames[0] };
                                this._playerNamesLoaded = true;
                            } else {
                                this._notify.errorFileHandle(ipcResult, 'BS AppData');
                                this._playerNamesLoaded = false;
                                this.playerNames = undefined;
                            }
                            this._playerNamesLoading.next(ipcResult);
                            return ipcResult;
                        } catch (error) {
                            this._playerNamesLoaded = false;
                            this._playerNamesLoading.next(false);
                            throw error;
                        }
                    } else {
                        loadPlayerNames = false;
                        return undefined;
                    }
                }
            ),
            takeWhile(result => result == null, true),
            reduce(
                (
                    acc: false | { result: string[] | undefined; status: TFileLoaded },
                    val: undefined | false | { result: string[] | undefined; status: TFileLoaded }
                ) => {
                    if (val != null) acc = val;
                    return acc;
                },
                false
            )
        );
    }

    async loadPlayersStats(): Promise<false | { status: TFileLoaded }> {
        try {
            const result = await this._eleService.invoke<TInvokeLoadPlayedSongs>(
                'LOAD_PLAYER_STATS',
                undefined
            );
            this._notify.errorFileHandle(result, 'BS AppData');
            if (this._playerNamesLoaded) {
                await this.loadPlayerNames().toPromise();
            }
            return result;
        } finally {
            this.playerStatsReloaded.next();
        }
    }
}
