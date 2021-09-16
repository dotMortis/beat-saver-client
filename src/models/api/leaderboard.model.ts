import { TSongHash } from '../maps/map-ids.model';
import { TMapDifficulty } from './api.models';

export type TBoardIdent = {
    hash: TSongHash;
    difficulty: TMapDifficulty;
};
