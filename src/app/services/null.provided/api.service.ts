import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    EListSortOrder,
    IListOptions,
    ListOptions,
    TSearchResult
} from '../../../models/api.models';

@Injectable({
    providedIn: null
})
export class ApiService {
    private readonly _basePath: string;
    private readonly _filter: ListOptions;
    private _latestFilter?: HttpParams;
    private _page: number;

    private _tSearchResult?: TSearchResult;
    get tSearchResult(): TSearchResult | undefined {
        return this._tSearchResult;
    }
    set tSearchResult(val: TSearchResult | undefined) {
        this._tSearchResult = val;
    }

    private _canLoadMore: boolean;
    get canLoadMore(): boolean {
        return this._canLoadMore;
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

    constructor(private _http: HttpClient) {
        this._basePath = 'https://beatsaver.com/api';
        this._filter = new ListOptions({});
        this._page = 0;
        this._canLoadMore = true;
    }

    public setboolFilter(key: keyof IListOptions, value: boolean | undefined): boolean | undefined {
        if (value != this._filter[key]) {
            this._filter[key] = <any>value;
            if (value === true) return true;
            else return false;
        }
        return undefined;
    }

    public getList(more: boolean): Observable<TSearchResult> {
        if (more) {
            this._page++;
        } else {
            this._page = 0;
            this._latestFilter = this._filter.getQueryParams();
        }
        return this._http
            .get<TSearchResult>(this._computePatch(['search', 'text', this._page]), {
                params: this._latestFilter
            })
            .pipe(
                tap((tSearchResult: TSearchResult) => {
                    this._canLoadMore = tSearchResult?.docs.length > 0;
                    if (more && this.tSearchResult?.docs.length) {
                        this.tSearchResult.docs.push(...tSearchResult.docs);
                    } else {
                        this.tSearchResult = tSearchResult;
                    }
                })
            );
    }

    public downloadZip(path: string) {
        return this._http.get(path, {
            responseType: 'blob',
            reportProgress: true,
            observe: 'events'
        });
    }

    private _computePatch(pathFragments: Array<string | number>): string {
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