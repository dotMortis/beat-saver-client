import { readFile } from 'fs';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';
import { TFileLoaded } from '../../src/models/electron/file-loaded.model';
import {
    TInvokeGetPlayerNames,
    TInvokeGetPlayerSongStats,
    TInvokeLoadPlayedSongs
} from '../../src/models/electron/invoke.channels';
import { TSongHash } from '../../src/models/maps/map-ids.model';
import { PlayerData, TLevelStatsInfo } from '../../src/models/player/player-data.model';
import { CommonLoader } from '../models/CommonLoader.model';
import { IpcHelerps } from '../models/helpers/ipc-main.helpers';
import { logger } from '../models/winston.logger';
import { settings } from './settings.loader';

export const loadPlayerStatsHandle = IpcHelerps.ipcMainHandle<TInvokeLoadPlayedSongs>(
    'LOAD_PLAYER_STATS',
    (event: Electron.IpcMainInvokeEvent, args: void) => {
        return playedMaps.loadPlayerStats();
    }
);

export const getPlayerSongStatsHandle = IpcHelerps.ipcMainHandle<TInvokeGetPlayerSongStats>(
    'GET_PLAYER_SONG_STATS',
    (event: Electron.IpcMainInvokeEvent, args) => {
        const { playerName, mapHash } = args;
        return playedMaps.getPlayerSongStatsFromHash(mapHash, playerName);
    }
);

export const getPlayerNamesHandle = IpcHelerps.ipcMainHandle<TInvokeGetPlayerNames>(
    'GET_PLAYER_NAMES',
    (event: Electron.IpcMainInvokeEvent, args: void) => {
        return playedMaps.getAvailablePlayers();
    }
);

class PlayedMaps extends CommonLoader {
    private get _filePath(): string {
        const tempPath = settings.getOpts().bsAppDataPath.value;
        return tempPath ? path.join(tempPath, 'PlayerData.dat') : '';
    }
    private _playerData?: PlayerData;
    private _loaded: BehaviorSubject<TFileLoaded>;
    private _playerStatsloading: boolean;

    constructor() {
        super();
        this._loaded = new BehaviorSubject<TFileLoaded>(false);
        this._playerStatsloading = false;
    }

    async loadPlayerStats(): Promise<{ status: TFileLoaded }> {
        logger.debug('loadPlayerStats');
        if (this._playerStatsloading) return { status: 'LOADING' };
        this._playerStatsloading = true;
        if (!this._filePath) {
            this._loaded.next('NO_PATH');
            this._loaded.next(false);
            this._playerStatsloading = false;
            return { status: 'NO_PATH' };
        }
        this._loaded.next('LOADING');
        return new Promise<{ status: TFileLoaded }>(res => {
            readFile(this._filePath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                if (err) {
                    return res({ status: 'INVALID_PATH' });
                }
                try {
                    const payload = JSON.parse(data.toString());

                    if (payload) {
                        this._playerData = new PlayerData(payload);
                    }
                    res({ status: 'LOADED' });
                } catch (error: any) {
                    this._loaded.next(error);
                    res({ status: error });
                }
            });
        })
            .then(result => {
                this._loaded.next(result.status);
                if (result.status !== 'LOADED' && result.status !== 'LOADING') {
                    this._loaded.next(false);
                }
                return result;
            })
            .finally(() => {
                this._playerStatsloading = false;
            });
    }

    async getAvailablePlayers(): Promise<{ status: TFileLoaded; result: undefined | string[] }> {
        logger.debug('getAvailablePlayers');
        return this._handleLoadPlayerStats<string[]>(async () => {
            const playerNames = new Array<string>();
            for (const [playerName, playerStats] of this._playerData?.localPlayers || []) {
                playerNames.push(playerName);
            }
            return playerNames;
        });
    }

    async getPlayerSongStatsFromHash(
        mapHash: TSongHash,
        playerName: string
    ): Promise<{ status: TFileLoaded; result: TLevelStatsInfo | undefined }> {
        logger.debug(`getPlayerSongStatsFromHash HASH: ${mapHash} PLAYER: ${playerName}`);
        return this._handleLoadPlayerStats<TLevelStatsInfo | undefined>(async () => {
            const playerData = this._playerData?.localPlayers.get(playerName);
            if (!playerData) {
                throw new Error(`Player with name ${playerName} not found.`);
            }
            return playerData.levelsStatsData.get(mapHash);
        });
    }

    private async _handleLoadPlayerStats<RESULT = never>(
        onLoaded: () => Promise<RESULT>
    ): Promise<{ status: TFileLoaded; result: RESULT | undefined }> {
        logger.debug(`handleLoadPlayerStats`);

        return new Promise<{ status: TFileLoaded; result: RESULT | undefined }>((res, rej) => {
            this._loaded
                .pipe(
                    mergeMap(async (status: TFileLoaded) => {
                        try {
                            logger.debug(`handleLoadPlayerStats`, status);
                            switch (status) {
                                case false: {
                                    await this.loadPlayerStats();
                                    break;
                                }
                                case 'LOADED': {
                                    return { status, result: await onLoaded() };
                                }
                                default: {
                                    break;
                                }
                            }
                            return { status, result: undefined };
                        } catch (error: any) {
                            return { status: error, result: undefined };
                        }
                    }),
                    takeWhile(
                        (result: { result: RESULT | undefined; status: TFileLoaded }) =>
                            result.status !== 'LOADED' &&
                            !(result.status instanceof Error) &&
                            result.status !== 'INVALID_PATH' &&
                            result.status !== 'NO_PATH',
                        true
                    )
                )
                .subscribe(result => {
                    if (result.status !== false && result.status !== 'LOADING') {
                        if (result.status instanceof Error) {
                            rej(result.status);
                        } else {
                            res(result);
                        }
                    }
                })
                .add(() => {
                    logger.debug(`handleLoadPlayerStats UNSUBSCRIBED`);
                });
        });
    }
}

const playedMaps = new PlayedMaps();
export default playedMaps;
