import { ECharacteristic, EDifficulty, TMapDifficulty, TMapVersion } from '../api/api.models';
import { TDifficultyIndex, TLevelStatsData, TLevelStatsInfo } from '../player/player-data.model';

export class MapsHelpers {
    public static getScoreClass(score: number): string {
        if (score >= 90) return 'score-90';
        else if (score >= 80) return 'score-80';
        return 'score-0';
    }

    public static getDifficultyLabel(difficulty?: EDifficulty): string {
        switch (difficulty) {
            case EDifficulty.Easy:
            case EDifficulty.Normal:
            case EDifficulty.Hard:
            case EDifficulty.Expert: {
                return difficulty;
            }
            case EDifficulty.ExpertPlus: {
                return 'Expert+';
            }
            default: {
                return 'N/A';
            }
        }
    }

    public static getCharacteristicIcon(characteristic?: ECharacteristic): string | undefined {
        if (!characteristic) return undefined;
        return `assets/icons/${characteristic.toLowerCase()}.svg`;
    }

    public static getIndexFromDifficulty(diff?: EDifficulty): TDifficultyIndex | undefined {
        switch (diff) {
            case EDifficulty.Easy: {
                return 0;
            }
            case EDifficulty.Normal: {
                return 1;
            }
            case EDifficulty.Hard: {
                return 2;
            }
            case EDifficulty.Expert: {
                return 3;
            }
            case EDifficulty.ExpertPlus: {
                return 4;
            }
            default: {
                return undefined;
            }
        }
    }

    public static getDifficulyFromIndex(index?: TDifficultyIndex): EDifficulty | undefined {
        switch (index) {
            case 0: {
                return EDifficulty.Easy;
            }
            case 1: {
                return EDifficulty.Normal;
            }
            case 2: {
                return EDifficulty.Hard;
            }
            case 3: {
                return EDifficulty.Expert;
            }
            case 4: {
                return EDifficulty.ExpertPlus;
            }
            default: {
                return undefined;
            }
        }
    }

    public static getDifficultyGroupedByChar(
        mapVersion: TMapVersion
    ): Map<ECharacteristic, TMapDifficulty[]> {
        const groupedDifs = new Map<ECharacteristic, TMapDifficulty[]>();
        for (const dif of mapVersion.diffs) {
            if (groupedDifs.has(dif.characteristic)) {
                groupedDifs.get(dif.characteristic)?.push(dif);
            } else {
                groupedDifs.set(dif.characteristic, [dif]);
            }
        }
        return groupedDifs;
    }

    public static getPlayerLevelStatsGroupedByChar(
        playerLevelStats: TLevelStatsInfo
    ): Map<ECharacteristic, TLevelStatsData[]> {
        const groupedStats = new Map<ECharacteristic, TLevelStatsData[]>();
        for (const stat of playerLevelStats.levelStats) {
            if (groupedStats.has(stat.beatmapCharacteristicName)) {
                groupedStats.get(stat.beatmapCharacteristicName)?.push(stat);
            } else {
                groupedStats.set(stat.beatmapCharacteristicName, [stat]);
            }
        }
        return groupedStats;
    }

    public static getDifficultyScoreSaberIndex(diff: EDifficulty): number {
        switch (diff) {
            case EDifficulty.Easy: {
                return 1;
            }
            case EDifficulty.Normal: {
                return 3;
            }
            case EDifficulty.Hard: {
                return 5;
            }
            case EDifficulty.Expert: {
                return 7;
            }
            case EDifficulty.ExpertPlus: {
                return 9;
            }
        }
    }

    public static getDifficultyFromScoreSaberIndex(diff: number): EDifficulty | undefined {
        switch (diff) {
            case 1: {
                return EDifficulty.Easy;
            }
            case 3: {
                return EDifficulty.Normal;
            }
            case 5: {
                return EDifficulty.Hard;
            }
            case 7: {
                return EDifficulty.Expert;
            }
            case 9: {
                return EDifficulty.ExpertPlus;
            }
            default: {
                return undefined;
            }
        }
    }

    public static getCharacteristicScoreSaberIndex(char: ECharacteristic): number {
        switch (char) {
            case ECharacteristic.Standard: {
                return 0;
            }
            case ECharacteristic.OneSaber: {
                return 1;
            }
            case ECharacteristic.NoArrows: {
                return 2;
            }
            case ECharacteristic['90Degree']: {
                return 3;
            }
            case ECharacteristic['360Degree']: {
                return 4;
            }
            case ECharacteristic.Lightshow: {
                return 5;
            }
            case ECharacteristic.Lawless: {
                return 6;
            }
        }
    }

    public static computeDiffId(diff?: TMapDifficulty): string | undefined {
        if (!diff) return undefined;
        return diff.difficulty + diff.characteristic;
    }

    public static calculateMaxScore(notes: number): number {
        if (notes >= 13) return (notes - 13) * 8 * 115 + 4715;
        else if (notes > 0) {
            if (notes === 1) return 115;
            else if (notes <= 5) return (notes - 1) * 2 * 115 + 115;
            else return (notes - 5) * 4 * 115 + 920 + 115;
        }
        return 0;
    }

    public static calculateScorePercent(maxScore: number, playerScore: number): number {
        return (100 / maxScore) * playerScore;
    }
}
