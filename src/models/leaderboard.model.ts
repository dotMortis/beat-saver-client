import { TMapDifficulty } from './api.models';
import { TSongHash } from './played-songs.model';

export type TBoardIdent = {
    hash: TSongHash;
    difficulty: TMapDifficulty;
};
