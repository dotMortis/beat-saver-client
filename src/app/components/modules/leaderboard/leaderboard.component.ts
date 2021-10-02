import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TLeaderboard, TScores } from '../../../../models/api/api.models';
import { TBoardIdent } from '../../../../models/api/leaderboard.model';
import { MapsHelpers } from '../../../../models/maps/maps.helpers';
import { ApiService } from '../../../services/null.provided/api.service';
import { NotifyService } from '../../../services/root.provided/notify.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent extends UnsubscribeComponent {
    private _boardIdent?: TBoardIdent | null;
    @Input()
    set boardIdent(val: TBoardIdent | undefined | null) {
        if (
            MapsHelpers.computeDiffId(val?.difficulty) !==
                MapsHelpers.computeDiffId(this._boardIdent?.difficulty) ||
            val?.hash !== this._boardIdent?.hash
        ) {
            this._boardIdent = val;
            this._boardIdentChange.next(val || undefined);
        }
    }
    get boardIdent(): TBoardIdent | undefined | null {
        return this._boardIdent;
    }

    private _uid?: number;
    get lbUrl(): string {
        return 'https://scoresaber.com/leaderboard/' + this._uid;
    }

    private _boardIdentChange: BehaviorSubject<TBoardIdent | undefined>;

    private _isInit: boolean;

    scores: TScores[];
    columns: {
        field: string;
        header: string;
        class?: string;
        headerClass?: string;
        'min-width'?: string;
        width?: string;
        default?: string | number;
    }[];
    loading: boolean;

    constructor(
        private _apiService: ApiService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotifyService
    ) {
        super(_notify);
        this._isInit = false;
        this._boardIdentChange = new BehaviorSubject<TBoardIdent | undefined>(undefined);
        this.columns = [
            {
                field: 'rank',
                header: '#',
                width: '50px',
                class: 'text-center',
                headerClass: 'text-center'
            },
            { field: 'name', header: 'Player', width: '200px', 'min-width': '100px' },
            { field: 'score', header: 'Score', 'min-width': '100px', width: '100px' },
            { field: 'mods', header: 'Mods', 'min-width': '65px', width: '65px', default: '-' },
            { field: 'scorePercent', header: '%', 'min-width': '65px', width: '65px' },
            { field: 'pp', header: 'PP', 'min-width': '65px', width: '65px', default: 0 }
        ];
        this.scores = new Array<TScores>();
        this.loading = false;
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
                            this._uid = lbs[0]?.uid;
                            let scores = new Array<TScores>();
                            for (const lb of lbs) {
                                this._calcScorePercent(lb.scores);
                                scores.push(...lb.scores);
                            }
                            this.scores = [...this.scores, ...scores];
                            this._cdr.detectChanges();
                        }),
                        catchError(() => {
                            this.scores = [];
                            return of(null);
                        }),
                        finalize(() => {
                            this.loading = false;
                            if (!this._isInit) {
                                this._isInit = true;
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
                        })
                    )
            );
        }
    }

    getCellValue(val: any, defaultVal: string | number): any {
        if (val == null || (val instanceof Array && val.length === 0)) return defaultVal || val;
        return val;
    }

    getScoreClass(score: number): string {
        return MapsHelpers.getScoreClass(score);
    }

    onRefresh(): void {
        this.scores = [];
        this.loadScoresLazy({ first: 0, rows: 20 });
        this._cdr.detectChanges();
    }

    private _calcScorePercent(scores: TScores[]): void {
        if (this._boardIdent && scores) {
            for (const score of scores) {
                score.scorePercent = MapsHelpers.calculateScorePercent(
                    MapsHelpers.calculateMaxScore(this._boardIdent.difficulty.notes),
                    score.score
                );
            }
        }
    }
}
