import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { delay, finalize, first, mergeMap, tap } from 'rxjs/operators';
import {
    ECharacteristic,
    EDifficulty,
    EListSortOrder,
    IListOptions,
    ListOptions,
    TLeaderboard,
    TMapDetail,
    TMapperListResult,
    TMapperResult,
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

    public getPaginatedMapListByMapper(
        mapperId: number,
        page: number
    ): Observable<TMapSearchResult> {
        return this._http.get<TMapSearchResult>(
            this._computePath(['maps', 'uploader', mapperId, page])
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

    public getMappperById(mapperId: number): Observable<TMapperResult> {
        return this._http.get<TMapperResult>(this._computePath(['users', 'id', mapperId]));
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
