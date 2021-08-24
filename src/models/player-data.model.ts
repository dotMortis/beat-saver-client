import { ECharacteristic } from './api.models';
import { TSongHash } from './played-songs.model';

export interface IPlayerData {
    version: string;
    localPlayers: Map<string, LocalPlayer>;
}

export class PlayerData implements IPlayerData {
    version: string;
    localPlayers: Map<string, LocalPlayer>;

    constructor(playerData: TPlayerData) {
        this.version = playerData.version;
        this.localPlayers = new Map<string, LocalPlayer>(
            playerData.localPlayers?.map((localPlayer: TLocalPlayer) => [
                localPlayer.playerName,
                new LocalPlayer(localPlayer)
            ])
        );
    }
}

export interface ILocalPlayer {
    playerId: string;
    playerName: string;
    levelsStatsData: Map<TSongHash, TLevelStatsInfo>;
    favoritesLevelIds: Set<TSongHash>;
}

export class LocalPlayer implements ILocalPlayer {
    playerId: string;
    playerName: string;
    levelsStatsData: Map<TSongHash, TLevelStatsInfo>;
    favoritesLevelIds: Set<TSongHash>;

    constructor(localPlayer: TLocalPlayer) {
        this.playerId = localPlayer.playerId;
        this.playerName = localPlayer.playerName;
        this.favoritesLevelIds = new Set<TSongHash>(
            localPlayer.favoritesLevelIds?.map((levelId: string) => toLevelHash(levelId)) || []
        );

        this.levelsStatsData = new Map<TSongHash, TLevelStatsInfo>();
        for (const levelStatsData of localPlayer.levelsStatsData || []) {
            if (levelStatsData.playCount < 1) continue;
            const levelHash = toLevelHash(levelStatsData.levelId);
            if (this.levelsStatsData.has(levelHash)) {
                this.levelsStatsData
                    .get(levelHash)
                    ?.levelStats.push(new LevelStatsData(levelStatsData));
            } else {
                this.levelsStatsData.set(levelHash, {
                    isFav: this.favoritesLevelIds.has(levelHash),
                    levelStats: new Array<LevelStatsData>(new LevelStatsData(levelStatsData))
                });
            }
        }
    }
}

export interface ILevelStatsData extends TLevelStatsData {}

export class LevelStatsData implements ILevelStatsData {
    levelId: TSongHash;
    difficulty: TDifficultyIndex;
    beatmapCharacteristicName: ECharacteristic;
    highScore: number;
    maxCombo: number;
    fullCombo: boolean;
    maxRank: number;
    validScore: boolean;
    playCount: number;

    constructor(levelStatsData: TLevelStatsData) {
        this.levelId = toLevelHash(levelStatsData.levelId);
        this.difficulty = levelStatsData.difficulty;
        this.beatmapCharacteristicName = levelStatsData.beatmapCharacteristicName;
        this.highScore = levelStatsData.highScore;
        this.maxCombo = levelStatsData.maxCombo;
        this.fullCombo = levelStatsData.fullCombo;
        this.maxRank = levelStatsData.maxRank;
        this.validScore = levelStatsData.validScore;
        this.playCount = levelStatsData.playCount;
    }
}

export type TPlayerData = {
    version: string;
    localPlayers: Array<TLocalPlayer>;
};

export type TLocalPlayer = {
    playerId: string;
    playerName: string | '<NO NAME!>';
    levelsStatsData: Array<TLevelStatsData>;
    favoritesLevelIds: Array<string>;
};

export type TLevelStatsData = {
    levelId: TSongHash;
    difficulty: TDifficultyIndex;
    beatmapCharacteristicName: ECharacteristic;
    highScore: number;
    maxCombo: number;
    fullCombo: boolean;
    maxRank: number;
    validScore: boolean;
    playCount: number;
};

export type TLevelStatsInfo = {
    isFav: boolean;
    levelStats: LevelStatsData[];
};
export type TDifficultyIndex = 0 | 1 | 2 | 3 | 4;

export const customLevelPrefix = 'custom_level_';

export const toLevelHash = (levelId: string): string => {
    if (levelId.startsWith(customLevelPrefix)) levelId = levelId.slice(customLevelPrefix.length);
    return levelId.toLowerCase();
};
