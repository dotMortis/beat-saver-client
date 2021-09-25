import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, delay, finalize, first, mergeMap, tap } from 'rxjs/operators';
import {
    ECharacteristic,
    EDifficulty,
    EListSortOrder,
    IListOptions,
    ListOptions,
    TLeaderboard,
    TMapDetail,
    TMapperListResult,
    TMapSearchResult
} from '../../../models/api/api.models';
import { TSongHash } from '../../../models/maps/map-ids.model';
import { MapsHelpers } from '../../../models/maps/maps.helpers';

@Injectable({
    providedIn: null
})
export class ApiService {
    private readonly _basePath: string;
    //#region Maps properties
    private readonly _filter: ListOptions;
    private _latestFilter?: HttpParams;
    private _mapsPage: number;

    get filter(): ListOptions {
        return this._filter;
    }

    private _tMapSearchResult?: TMapSearchResult;
    get tMapSearchResult(): TMapSearchResult | undefined {
        return this._tMapSearchResult;
    }
    set tMapSearchResult(val: TMapSearchResult | undefined) {
        this._tMapSearchResult = val;
        this.tMapSearchResultChange.next(this._tMapSearchResult);
    }
    tMapSearchResultChange: Subject<TMapSearchResult | undefined>;

    private _canLoadMoreMaps: boolean;
    get canLoadMoreMaps(): boolean {
        return this._canLoadMoreMaps;
    }

    private _npsRange = [0, 16];
    set npsRange(value: number[]) {
        this._npsRange = value;
        this._filter.minNps = value[0] ? value[0] : undefined;
        this._filter.maxNps = value[1] === 16 ? undefined : value[1];
    }
    get npsRange(): number[] {
        return this._npsRange;
    }
    get minNps(): number | undefined {
        return this._npsRange[0];
    }
    get maxNps(): number | undefined {
        return this._npsRange[1];
    }

    set orderBy(code: EListSortOrder) {
        if (this._filter.sortOrder !== code) {
            this._filter.sortOrder = code;
        }
    }

    set q(value: string | undefined) {
        this._filter.set('q', value?.trim() || undefined);
    }
    get q(): string | undefined {
        return this._filter.q;
    }

    private _dateRange?: Date[];
    set dateRange(range: Date[] | undefined) {
        this._dateRange = range;
        this._filter.from = range ? range[0] : undefined;
        this._filter.to = range ? range[1] : undefined;
    }
    get dateRange(): Date[] | undefined {
        return this._dateRange;
    }
    //#endregion

    //#region Mappers properties
    private _mappersPage: number;

    private _tMappersSearchResult?: TMapperListResult[];
    get tMappersSearchResult(): TMapperListResult[] | undefined {
        return this._tMappersSearchResult;
    }
    set tMappersSearchResult(val: TMapperListResult[] | undefined) {
        this._tMappersSearchResult = val;
    }

    private _canLoadMoreMappers: boolean;
    get canLoadMoreMappers(): boolean {
        return this._canLoadMoreMappers;
    }

    //#endregion
    constructor(private _http: HttpClient) {
        this._basePath = 'https://beatsaver.com/api';
        this._filter = new ListOptions({});
        this._mappersPage = this._mapsPage = 0;
        this._canLoadMoreMappers = this._canLoadMoreMaps = true;
        this.tMapSearchResultChange = new Subject<TMapSearchResult | undefined>();
    }

    public setboolFilter(key: keyof IListOptions, value: boolean | undefined): boolean | undefined {
        if (value != this._filter[key]) {
            this._filter[key] = <any>value;
            if (value === true) return true;
            else return false;
        }
        return undefined;
    }

    public getMapList(more: boolean): Observable<TMapSearchResult> {
        if (more) {
            this._mapsPage++;
        } else {
            this._mapsPage = 0;
            this._latestFilter = this._filter.getQueryParams();
        }
        return this._http
            .get<TMapSearchResult>(this._computePath(['search', 'text', this._mapsPage]), {
                params: this._latestFilter
            })
            .pipe(
                tap((tSearchResult: TMapSearchResult) => {
                    this._canLoadMoreMaps = tSearchResult?.docs.length > 0;
                    if (more && this.tMapSearchResult?.docs.length) {
                        this.tMapSearchResult.docs.push(...tSearchResult.docs);
                    } else {
                        this.tMapSearchResult = tSearchResult;
                    }
                })
            );
    }

    public getMapppersList(moreOrPage: boolean | number): Observable<TMapperListResult[]> {
        if (typeof moreOrPage === 'boolean' && moreOrPage === true) {
            this._mappersPage++;
        } else if (typeof moreOrPage === 'number') {
            this._mappersPage = moreOrPage;
        } else {
            this._mappersPage = 0;
        }
        return this._http
            .get<TMapperListResult[]>(this._computePath(['users', 'list', this._mappersPage]))
            .pipe(
                catchError(() => {
                    return of([
                        {
                            id: 58338,
                            name: 'Joetastic',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/227767566402191360.png',
                            stats: {
                                totalUpvotes: 295133,
                                totalDownvotes: 12425,
                                totalMaps: 921,
                                rankedMaps: 2,
                                avgBpm: 150.21,
                                avgScore: 83.6,
                                avgDuration: 181.0,
                                firstUpload: '2018-08-14T06:42:58Z',
                                lastUpload: '2021-09-25T18:20:53.851146Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 30311,
                            name: 'bennydabeast',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7298cc5a672c84e98d?d=retro',
                            stats: {
                                totalUpvotes: 115919,
                                totalDownvotes: 4547,
                                totalMaps: 46,
                                rankedMaps: 4,
                                avgBpm: 132.3,
                                avgScore: 87.1,
                                avgDuration: 214.0,
                                firstUpload: '2018-05-18T22:24:22Z',
                                lastUpload: '2020-04-05T21:40:37.685Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 12996,
                            name: 'rustic',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7298cc5a672c84e8c4?d=retro',
                            stats: {
                                totalUpvotes: 108532,
                                totalDownvotes: 4471,
                                totalMaps: 83,
                                rankedMaps: 20,
                                avgBpm: 141.95,
                                avgScore: 86.5,
                                avgDuration: 214.0,
                                firstUpload: '2018-05-08T18:56:36Z',
                                lastUpload: '2021-05-08T18:52:19.401Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 41378,
                            name: 'greatyazer',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7298cc5a672c84ea71?d=retro',
                            stats: {
                                totalUpvotes: 81028,
                                totalDownvotes: 3561,
                                totalMaps: 25,
                                rankedMaps: 7,
                                avgBpm: 134.56,
                                avgScore: 87.7,
                                avgDuration: 221.0,
                                firstUpload: '2018-05-20T09:59:02Z',
                                lastUpload: '2019-05-19T12:26:06Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 4284981,
                            name: 'skylerwallace',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/398344856868487168.png',
                            stats: {
                                totalUpvotes: 70551,
                                totalDownvotes: 2876,
                                totalMaps: 74,
                                rankedMaps: 2,
                                avgBpm: 134.88,
                                avgScore: 86.2,
                                avgDuration: 212.0,
                                firstUpload: '2018-05-19T06:59:11Z',
                                lastUpload: '2021-09-22T02:59:40.079806Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4235140,
                            name: 'etan',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/136373107559497728.png',
                            stats: {
                                totalUpvotes: 64213,
                                totalDownvotes: 1432,
                                totalMaps: 82,
                                rankedMaps: 1,
                                avgBpm: 147.58,
                                avgScore: 89.2,
                                avgDuration: 163.0,
                                firstUpload: '2019-03-04T07:04:15Z',
                                lastUpload: '2021-07-02T06:34:33.775Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4285318,
                            name: 'kolezan',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/220513618763055106.png',
                            stats: {
                                totalUpvotes: 59390,
                                totalDownvotes: 1907,
                                totalMaps: 37,
                                rankedMaps: 4,
                                avgBpm: 152.16,
                                avgScore: 89.0,
                                avgDuration: 197.0,
                                firstUpload: '2018-08-12T18:59:21Z',
                                lastUpload: '2020-04-01T16:00:57.956Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4285018,
                            name: 'majorpickle',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/450358937657671680.png',
                            stats: {
                                totalUpvotes: 55626,
                                totalDownvotes: 3253,
                                totalMaps: 314,
                                rankedMaps: 0,
                                avgBpm: 126.52,
                                avgScore: 82.5,
                                avgDuration: 225.0,
                                firstUpload: '2018-06-28T00:05:34Z',
                                lastUpload: '2021-09-25T15:20:24.487832Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4285982,
                            name: 'downycat',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/173538829888782336.png',
                            stats: {
                                totalUpvotes: 55232,
                                totalDownvotes: 2378,
                                totalMaps: 32,
                                rankedMaps: 2,
                                avgBpm: 137.97,
                                avgScore: 89.0,
                                avgDuration: 215.0,
                                firstUpload: '2018-05-25T15:03:45Z',
                                lastUpload: '2020-10-15T09:23:45.688Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 47581,
                            name: 'freeek',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7298cc5a672c84e8ad?d=retro',
                            stats: {
                                totalUpvotes: 54502,
                                totalDownvotes: 6027,
                                totalMaps: 26,
                                rankedMaps: 9,
                                avgBpm: 121.23,
                                avgScore: 81.6,
                                avgDuration: 225.0,
                                firstUpload: '2018-05-11T12:36:36Z',
                                lastUpload: '2018-12-03T18:23:49Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 4285107,
                            name: 'kikaeaeon',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/103715469822816256.png',
                            stats: {
                                totalUpvotes: 53267,
                                totalDownvotes: 2329,
                                totalMaps: 248,
                                rankedMaps: 0,
                                avgBpm: 155.03,
                                avgScore: 79.0,
                                avgDuration: 205.0,
                                firstUpload: '2018-08-29T06:06:25Z',
                                lastUpload: '2021-09-24T21:14:53.386356Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4285169,
                            name: 'ryger',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/169266024502263808.png',
                            stats: {
                                totalUpvotes: 52961,
                                totalDownvotes: 2107,
                                totalMaps: 140,
                                rankedMaps: 0,
                                avgBpm: 136.98,
                                avgScore: 85.5,
                                avgDuration: 197.0,
                                firstUpload: '2019-03-16T02:02:52Z',
                                lastUpload: '2021-09-15T16:00:08.432391Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 27983,
                            name: 'heisenbergirl',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7298cc5a672c84ec30?d=retro',
                            stats: {
                                totalUpvotes: 50466,
                                totalDownvotes: 3074,
                                totalMaps: 79,
                                rankedMaps: 1,
                                avgBpm: 142.72,
                                avgScore: 84.1,
                                avgDuration: 211.0,
                                firstUpload: '2018-06-05T14:03:12Z',
                                lastUpload: '2020-05-14T14:53:07.034Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 37070,
                            name: 'anniversaryteam',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7798cc5a672c8565a3?d=retro',
                            stats: {
                                totalUpvotes: 49418,
                                totalDownvotes: 2044,
                                totalMaps: 28,
                                rankedMaps: 0,
                                avgBpm: 143.64,
                                avgScore: 89.5,
                                avgDuration: 196.0,
                                firstUpload: '2019-05-03T14:08:02Z',
                                lastUpload: '2019-10-09T06:45:54.603Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 4285250,
                            name: 'dack',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/297344689798119424.png',
                            stats: {
                                totalUpvotes: 46480,
                                totalDownvotes: 1675,
                                totalMaps: 147,
                                rankedMaps: 1,
                                avgBpm: 148.55,
                                avgScore: 81.0,
                                avgDuration: 179.0,
                                firstUpload: '2019-01-26T15:21:37Z',
                                lastUpload: '2021-09-13T12:40:02.117902Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4284588,
                            name: 'rigid',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/295613108947386368.png',
                            stats: {
                                totalUpvotes: 46216,
                                totalDownvotes: 2881,
                                totalMaps: 335,
                                rankedMaps: 3,
                                avgBpm: 156.27,
                                avgScore: 80.0,
                                avgDuration: 144.0,
                                firstUpload: '2019-06-05T19:11:47Z',
                                lastUpload: '2021-08-30T11:58:50.109347Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4285521,
                            name: 'ejiejidayo',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/224894241279574016.png',
                            stats: {
                                totalUpvotes: 45112,
                                totalDownvotes: 1818,
                                totalMaps: 96,
                                rankedMaps: 3,
                                avgBpm: 159.95,
                                avgScore: 86.0,
                                avgDuration: 172.0,
                                firstUpload: '2018-08-10T09:36:58Z',
                                lastUpload: '2021-08-29T02:03:38.466509Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 23751,
                            name: 'monteblanco',
                            uniqueSet: true,
                            avatar: 'https://www.gravatar.com/avatar/5cff0b7798cc5a672c855ef5?d=retro',
                            stats: {
                                totalUpvotes: 44129,
                                totalDownvotes: 2058,
                                totalMaps: 144,
                                rankedMaps: 0,
                                avgBpm: 158.62,
                                avgScore: 84.3,
                                avgDuration: 147.0,
                                firstUpload: '2019-06-29T22:13:13Z',
                                lastUpload: '2020-07-13T08:22:21.370Z'
                            },
                            type: 'SIMPLE'
                        },
                        {
                            id: 4288620,
                            name: 'hexagonial',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/221442943045599232.png',
                            stats: {
                                totalUpvotes: 38957,
                                totalDownvotes: 8282,
                                totalMaps: 84,
                                rankedMaps: 18,
                                avgBpm: 194.52,
                                avgScore: 72.9,
                                avgDuration: 203.0,
                                firstUpload: '2018-06-11T22:11:18Z',
                                lastUpload: '2021-04-25T03:51:25.686Z'
                            },
                            type: 'DISCORD'
                        },
                        {
                            id: 4284201,
                            name: 'nitronikexe',
                            uniqueSet: true,
                            avatar: 'https://cdn.beatsaver.com/avatar/428230049704181760.png',
                            stats: {
                                totalUpvotes: 36330,
                                totalDownvotes: 1354,
                                totalMaps: 117,
                                rankedMaps: 0,
                                avgBpm: 149.14,
                                avgScore: 83.9,
                                avgDuration: 210.0,
                                firstUpload: '2019-04-11T09:05:58Z',
                                lastUpload: '2021-09-17T20:38:07.066845Z'
                            },
                            type: 'DISCORD'
                        }
                    ]);
                }),
                tap((tSearchResults: TMapperListResult[]) => {
                    this._canLoadMoreMappers = tSearchResults.length > 0;
                    if (moreOrPage && this.tMappersSearchResult?.length) {
                        this.tMappersSearchResult.push(...tSearchResults);
                    } else {
                        this.tMappersSearchResult = tSearchResults;
                    }
                })
            );
    }

    public getLeaderboard(
        songHash: TSongHash,
        difficulty: EDifficulty,
        characteristic: ECharacteristic,
        pages: number[]
    ) {
        let queryParams = new HttpParams();
        queryParams = queryParams.append(
            'difficulty',
            MapsHelpers.getDifficultyScoreSaberIndex(difficulty)
        );
        queryParams = queryParams.append(
            'gameMode',
            MapsHelpers.getCharacteristicScoreSaberIndex(characteristic)
        );
        return forkJoin(
            pages.map((page: number) => {
                return this._http.get<TLeaderboard>(this._computePath(['scores', songHash, page]), {
                    params: queryParams
                });
            })
        );
    }

    private _requests = 0;
    public getById(songId: string): Observable<TMapDetail> {
        this._requests++;
        return of(null).pipe(
            first(),
            delay((this._requests - 1) * 100),
            mergeMap(() => this._http.get<TMapDetail>(this._computePath(['maps', 'id', songId]))),
            finalize(() => this._requests--)
        );
    }

    public downloadZip(path: string) {
        return this._http.get(path, {
            responseType: 'blob',
            reportProgress: true,
            observe: 'events'
        });
    }

    private _computePath(pathFragments: Array<string | number>): string {
        let tempPath = this._basePath;
        for (const fragment of pathFragments) {
            const strFragment = typeof fragment === 'number' ? fragment.toString() : fragment;
            const subFragments = strFragment
                .split('/')
                .filter((subFragment: string) => !!subFragment.trim());
            tempPath = [tempPath, ...subFragments].join('/');
        }
        return tempPath;
    }
}
