import { HttpParams } from '@angular/common/http';
import { Helpers } from './helpers.model';

export interface IListOptions {
    automapper?: boolean;
    me?: boolean;
    chroma?: boolean;
    cinema?: boolean;
    from?: Date;
    to?: Date;
    fullSpead?: boolean;
    maxBpm?: number;
    maxDuration?: number;
    maxNps?: number;
    maxRating?: number;
    minBpm?: number;
    minDuration?: number;
    minNps?: number;
    minRating?: number;
    noodle?: boolean;
    q?: string;
    ranked?: boolean;
    sortOrder?: EListSortOrder;
}
export class ListOptions implements IListOptions {
    q?: string;
    automapper?: boolean;
    chroma?: boolean;
    cinema?: boolean;
    me?: boolean;
    from?: Date;
    to?: Date;
    fullSpead?: boolean;
    maxBpm?: number;
    maxDuration?: number;
    maxNps?: number;
    maxRating?: number;
    minBpm?: number;
    minDuration?: number;
    minNps?: number;
    minRating?: number;
    noodle?: boolean;
    ranked?: boolean;
    sortOrder?: EListSortOrder;

    constructor(options: IListOptions) {
        Helpers.assignNotNull<ListOptions>(this, 'q', options);
        Helpers.assignNotNull<ListOptions>(this, 'automapper', options);
        Helpers.assignNotNull<ListOptions>(this, 'me', options);
        Helpers.assignNotNull<ListOptions>(this, 'chroma', options);
        Helpers.assignNotNull<ListOptions>(this, 'cinema', options);
        Helpers.assignNotNull<ListOptions>(this, 'from', options);
        Helpers.assignNotNull<ListOptions>(this, 'to', options);
        Helpers.assignNotNull<ListOptions>(this, 'fullSpead', options);
        Helpers.assignNotNull<ListOptions>(this, 'maxBpm', options);
        Helpers.assignNotNull<ListOptions>(this, 'maxDuration', options);
        Helpers.assignNotNull<ListOptions>(this, 'maxNps', options);
        Helpers.assignNotNull<ListOptions>(this, 'maxRating', options);
        Helpers.assignNotNull<ListOptions>(this, 'minBpm', options);
        Helpers.assignNotNull<ListOptions>(this, 'minDuration', options);
        Helpers.assignNotNull<ListOptions>(this, 'minNps', options);
        Helpers.assignNotNull<ListOptions>(this, 'minRating', options);
        Helpers.assignNotNull<ListOptions>(this, 'noodle', options);
        Helpers.assignNotNull<ListOptions>(this, 'ranked', options);
        Helpers.assignNotNull<ListOptions>(this, 'sortOrder', options);
    }

    set<T extends ListOptions, KEY extends keyof T>(key: KEY, value: T[KEY]) {
        Object.assign(this, { [key]: value });
    }

    getAllTrue(): Array<keyof ListOptions> {
        return <Array<keyof ListOptions>>Object.keys(this).filter((key: string) => {
            const typedKey = <keyof ListOptions>key;
            return this[typedKey] === true;
        });
    }

    getQueryParams(): HttpParams {
        let params = new HttpParams();
        Object.keys(this).forEach((key: string) => {
            const tempVal = this[key as keyof IListOptions];
            if (tempVal instanceof Date) {
                let day = tempVal.getDate().toString();
                if (day.length === 1) day = '0' + day;
                let month = (tempVal.getMonth() + 1).toString();
                if (month.length === 1) month = '0' + month;
                const year = tempVal.getFullYear();
                params = params.append(key, `${year}-${month}-${day}`);
            } else if (tempVal != null) {
                params = params.append(key, tempVal.toString());
            }
        });
        return params;
    }
}

export enum EListSortOrder {
    'LATEST' = 'Latest',
    'RELEVANCE' = 'Relevance',
    'RATING' = 'Rating'
}

export type TSearchResult = {
    docs: Array<TMapDetail>;
    redirect: string;
    user: TUserDetail;
};

export type TMapDetail = {
    automapper: boolean;
    curator: string;
    description: string;
    id: string;
    metadata: TMapDetailMetadata;
    name: string;
    qualified: boolean;
    ranked: boolean;
    stats: TMapStats;
    uploaded: TInstant;
    uploader: TUserDetail;
    versions: Array<TMapVersion>;
};

export type TMapDetailMetadata = {
    bpm: number;
    duration: number;
    levelAuthorName: string;
    songAuthorName: string;
    songName: string;
    songSubName: string;
};

export type TMapStats = {
    downloads: number;
    downvotes: number;
    plays: number;
    score: number;
    upvotes: number;
};

export type TMapVersion = {
    coverURL: string;
    createdAt: TInstant;
    diffs: Array<TMapDifficulty>;
    downloadURL: string;
    feedback: string;
    hash: string;
    key: string;
    previewURL: string;
    sageScore: number;
    state: EState;
    testplayAt: TInstant;
    testplays: Array<TMapTestplay>;
};

export type TMapDifficulty = {
    bombs: number;
    chroma: boolean;
    cinema: boolean;
    difficulty: EDifficulty;
    characteristic: ECharacteristic;
    events: number;
    length: number;
    me: boolean;
    ne: boolean;
    njs: number;
    notes: number;
    nps: number;
    obstacles: number;
    offset: number;
    paritySummary: TMapParitySummary;
    seconds: number;
    stars: number;
};

export type TMapTestplay = {
    createdAt: TInstant;
    feedback: string;
    feedbackAt: TInstant;
    user: TUserDetail;
    video: string;
};

export type TMapParitySummary = {
    errors: number;
    resets: number;
    warns: number;
};

export type TUserDetail = {
    avatar: string;
    hash: string;
    id: number;
    name: string;
    stats: TUserStats;
    testplay: boolean;
};

export type TUserStats = {
    avgBpm: number;
    avgDuration: number;
    avgScore: number;
    diffStats: TUserDiffStats;
    firstUpload: TInstant;
    rankedMaps: number;
    totalDownvotes: number;
    totalMaps: number;
    totalUpvotes: number;
};

export type TUserDiffStats = {
    easy: number;
    expert: number;
    expertPlus: number;
    hard: number;
    normal: number;
    total: number;
};

export type TInstant = string;

export enum EState {
    Uploaded = 'Uploaded',
    Testplay = 'Testplay',
    Published = 'Published',
    Feedback = 'Feedback'
}

export enum EDifficulty {
    Easy = 'Easy',
    Normal = 'Normal',
    Hard = 'Hard',
    Expert = 'Expert',
    ExpertPlus = 'ExpertPlus'
}

export enum ECharacteristic {
    'Standard' = 'Standard',
    'OneSaber' = 'OneSaber',
    'NoArrows' = 'NoArrows',
    '90Degree' = '90Degree',
    '360Degree' = '360Degree',
    'Lightshow' = 'Lightshow',
    'Lawless' = 'Lawless'
}

export type TLeaderboard = {
    mods: boolean;
    ranked: boolean;
    uid: number;
    valid: boolean;
    scores: Array<TScores>;
};

export type TScores = {
    mods: Array<string>;
    name: string;
    playerId: number;
    pp: number;
    rank: number;
    score: number;
    scorePercent: number;
};
