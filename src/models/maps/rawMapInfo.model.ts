import { ECharacteristic } from '../api/api.models';

export type TRawMapInfo = {
    _songName: string;
    _songSubName: string;
    _songAuthorName: string;
    _levelAuthorName: string;
    _beatsPerMinute: number;
    _coverImageFilename: string;
    _difficultyBeatmapSets: TDifficulyBeatmapSet[];
};

export type TDifficulyBeatmapSet = {
    _beatmapCharacteristicName: ECharacteristic;
    _difficultyBeatmaps: TDifficultyBeatmap[];
};

export type TDifficultyBeatmap = {
    _difficultyRank: number;
    _beatmapFilename: string;
};
