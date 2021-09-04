import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiHelpers } from '../../../../models/api.helpers';
import { TLeaderboard, TScores } from '../../../../models/api.models';
import { TBoardIdent } from '../../../../models/leaderboard.model';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { ApiService } from '../../../services/null.provided/api.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent extends UnsubscribeComponent {
    private _boardIdent?: TBoardIdent | null;
    @Input()
    set boardIdent(val: TBoardIdent | undefined | null) {
        console.log('boardIdent', val);
        if (
            ApiHelpers.computeDiffId(val?.difficulty) !==
                ApiHelpers.computeDiffId(this._boardIdent?.difficulty) ||
            val?.hash !== this._boardIdent?.hash
        ) {
            this._boardIdent = val;
            this._boardIdentChange.next(val || undefined);
        }
    }
    get boardIdent(): TBoardIdent | undefined | null {
        return this._boardIdent;
    }

    private _boardIdentChange: BehaviorSubject<TBoardIdent | undefined>;

    scores: TScores[];
    columns: { field: string; header: string }[];

    constructor(private _apiService: ApiService) {
        super();
        this._boardIdentChange = new BehaviorSubject<TBoardIdent | undefined>(undefined);
        this.columns = [
            { field: 'rank', header: 'rank' },
            { field: 'name', header: 'name' },
            { field: 'score', header: 'score' },
            { field: 'mods', header: 'mods' },
            { field: 'scorePercent', header: '%' },
            { field: 'pp', header: 'pp' }
        ];
        this.scores = new Array<TScores>();
    }

    isNumber(value: any): boolean {
        return typeof value === 'number';
    }

    loadScoresLazy(event: any): void {
        console.log(event);
        if (this.boardIdent) {
            this._apiService
                .getLeaderboard(
                    this.boardIdent.hash,
                    this.boardIdent.difficulty.difficulty,
                    this.boardIdent.difficulty.characteristic,
                    1
                )
                .pipe(
                    tap((leaderboard: TLeaderboard | undefined) => {
                        const scores = undefined; //leaderboard?.scores;
                        this.scores = scores || [
                            {
                                mods: [],
                                name: 'asd',
                                playerId: 123,
                                pp: 123,
                                rank: 1,
                                score: 123,
                                scorePercent: 99.9
                            }
                        ];
                    })
                )
                .subscribe();
        }
    }

    private _calcScorePercent(scores: TScores[]): void {
        if (this._boardIdent && scores) {
            for (const score of scores) {
                score.scorePercent = ApiHelpers.calculateScorePercent(
                    ApiHelpers.calculateMaxScore(this._boardIdent.difficulty.notes),
                    score.score
                );
            }
        }
    }
}
