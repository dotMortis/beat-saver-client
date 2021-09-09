import { ApiHelpers } from './api.helpers';
import { ECharacteristic, EDifficulty } from './api.models';
import { TDifficulyBeatmapSet, TRawMapInfo } from './rawMapInfo.model';

export type TDBLocalMapInfo = {
    id: string;
    song_name: string;
    song_sub_name: string | null;
    song_author_name: string | null;
    level_author_name: string;
    bpm: number;
    cover_image_filename: string | null;
    difficulties: string | null;
    hash: string;
};

export interface ILocalMapInfo {
    id: string;
    song_name: string;
    song_sub_name: string | null;
    song_author_name: string | null;
    level_author_name: string;
    bpm: number;
    cover_image_filename: string | null;
    difficulties: LocalDifficulty[] | null;
    hash: string;
}

export class LocalMapInfo implements ILocalMapInfo {
    id: string;
    song_name: string;
    song_sub_name: string | null;
    song_author_name: string | null;
    level_author_name: string;
    bpm: number;
    cover_image_filename: string | null;
    difficulties: LocalDifficulty[] | null;
    hash: string;

    constructor(localMapInfo?: ILocalMapInfo | TDBLocalMapInfo) {
        this.id = localMapInfo ? localMapInfo.id : '';
        this.song_name = localMapInfo ? localMapInfo.song_name : '';
        this.song_sub_name = localMapInfo ? localMapInfo.song_sub_name : '';
        this.song_author_name = localMapInfo ? localMapInfo.song_author_name : '';
        this.level_author_name = localMapInfo ? localMapInfo.level_author_name : '';
        this.bpm = localMapInfo ? localMapInfo.bpm : 0;
        this.cover_image_filename = localMapInfo ? localMapInfo.cover_image_filename : '';
        this.hash = localMapInfo ? localMapInfo.hash : '';
        if (typeof localMapInfo?.difficulties === 'string') {
            this.difficulties = localMapInfo
                ? JSON.parse(localMapInfo.difficulties)?.map(
                      (diff: ILocalDifficulty) => new LocalDifficulty(diff)
                  )
                : [];
        } else {
            this.difficulties = localMapInfo
                ? localMapInfo?.difficulties?.map(
                      (diff: ILocalDifficulty) => new LocalDifficulty(diff)
                  ) || null
                : null;
        }
    }

    toStorage(): any {
        return {
            ...this,
            difficulties: JSON.stringify(this.difficulties)
        };
    }

    public static fromRawMapInfo(rawMap: TRawMapInfo, hash: string, id: string): LocalMapInfo {
        const localMapInfo = new LocalMapInfo();
        localMapInfo.id = id;
        localMapInfo.song_name = rawMap._songName;
        localMapInfo.song_sub_name = rawMap._songSubName;
        localMapInfo.song_author_name = rawMap._songAuthorName;
        localMapInfo.level_author_name = rawMap._levelAuthorName;
        localMapInfo.bpm = rawMap._beatsPerMinute;
        localMapInfo.cover_image_filename = rawMap._coverImageFilename;
        localMapInfo.difficulties = LocalDifficulty.fromLocalBeatmapSets(
            rawMap._difficultyBeatmapSets
        );
        localMapInfo.hash = hash;
        return localMapInfo;
    }
}

export interface ILocalDifficulty {
    characteristic?: ECharacteristic;
    difficulty?: EDifficulty;
}

export class LocalDifficulty implements ILocalDifficulty {
    characteristic?: ECharacteristic;
    difficulty?: EDifficulty;

    constructor(localDifficulty?: ILocalDifficulty) {
        this.characteristic = localDifficulty?.characteristic;
        this.difficulty = localDifficulty?.difficulty;
    }

    public static fromLocalBeatmapSets(beatmapSets: TDifficulyBeatmapSet[]): LocalDifficulty[] {
        const localDifficulties = new Array<LocalDifficulty>();
        for (const beatmapSet of beatmapSets) {
            for (const diff of beatmapSet._difficultyBeatmaps) {
                const localDifficulty = new LocalDifficulty();
                localDifficulty.characteristic = beatmapSet._beatmapCharacteristicName;
                localDifficulty.difficulty = ApiHelpers.getDifficultyFromScoreSaberIndex(
                    diff._difficultyRank
                );
                localDifficulties.push(localDifficulty);
            }
        }
        return localDifficulties;
    }
}
