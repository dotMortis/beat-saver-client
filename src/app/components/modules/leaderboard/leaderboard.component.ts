import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
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
export class LeaderboardComponent extends UnsubscribeComponent implements OnInit {
    private _boardIdent?: TBoardIdent | null;
    @Input()
    set boardIdent(val: TBoardIdent | undefined | null) {
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
    loading: boolean;

    constructor(private _apiService: ApiService, private _cdr: ChangeDetectorRef) {
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
        this.loading = false;
    }

    ngOnInit(): void {
        this.addSub(
            this._boardIdentChange.pipe(
                tap(() => {
                    this.scores = [];
                    this.loadScoresLazy({ first: 0, rows: 20 });
                    this._cdr.detectChanges();
                })
            )
        );
    }

    isNumber(value: any): boolean {
        return typeof value === 'number';
    }

    loadScoresLazy(event: LazyLoadEvent): void {
        const pages = new Array<number>();
        const tableFirst = event.first || 0;
        const tableRows = event.rows || 0;
        let pagesToLoad =
            tableFirst + tableRows > 0 ? tableRows + tableFirst - this.scores.length : 0;
        pagesToLoad = pagesToLoad ? pagesToLoad / 10 : 0;
        const lastPage = tableRows + tableFirst ? (tableRows + tableFirst) / 10 : pagesToLoad;
        if (pagesToLoad < 1) return;
        for (let z = lastPage; z > lastPage - pagesToLoad; z--) {
            if (z !== 0) pages.unshift(z);
        }
        if (this.boardIdent) {
            this.loading = true;
            this.addSub(
                this._apiService
                    .getLeaderboard(
                        this.boardIdent.hash,
                        this.boardIdent.difficulty.difficulty,
                        this.boardIdent.difficulty.characteristic,
                        pages
                    )
                    .pipe(
                        tap((lbs: TLeaderboard[]) => {
                            let scores = new Array<TScores>();
                            for (const lb of lbs) {
                                this._calcScorePercent(lb.scores);
                                scores.push(...lb.scores);
                            }
                            this.scores = [...this.scores, ...scores];
                            this._cdr.detectChanges();
                            this.loading = false;
                        })
                    )
            );
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
