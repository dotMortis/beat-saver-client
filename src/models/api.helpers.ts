import { ECharacteristic, EDifficulty, TMapDifficulty, TMapVersion } from './api.models';
import { TDifficultyIndex } from './player-data.model';

export class ApiHelpers {
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
}
