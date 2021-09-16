import { Injectable } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { TInvokeFilterLocalMaps } from '../../../models/electron/invoke.channels';
import { LocalMapsFilter } from '../../../models/maps/local-maps-filter.model';
import { ILocalMapInfo } from '../../../models/maps/localMapInfo.model';
import { ElectronService } from '../root.provided/electron.service';

@Injectable({
    providedIn: null
})
export class LocalMapsService {
    private readonly _filter: LocalMapsFilter;
    private _latestFilter?: LocalMapsFilter;
    private _page: number;

    get filter(): LocalMapsFilter {
        return this._filter;
    }

    private _searchResult: ILocalMapInfo[] | false;
    get searchResult(): ILocalMapInfo[] | false {
        return this._searchResult;
    }
    set searchResult(val: ILocalMapInfo[] | false) {
        this._searchResult = val;
        this.searchResultChange.next(this._searchResult);
    }
    searchResultChange: Subject<ILocalMapInfo[] | false>;

    private _canLoadMore: boolean;
    get canLoadMore(): boolean {
        return this._canLoadMore;
    }

    set q(value: string | undefined) {
        this._filter.set('q', value?.trim() || undefined);
    }
    get q(): string | undefined {
        return this._filter.q;
    }

    constructor(private _eleService: ElectronService) {
        this._filter = new LocalMapsFilter({});
        this._page = 0;
        this._canLoadMore = true;
        this._searchResult = [];
        this.searchResultChange = new Subject<ILocalMapInfo[] | false>();
    }

    public getList(more: boolean): Observable<false | ILocalMapInfo[]> {
        if (more) {
            this._page++;
        } else {
            this._page = 0;
            this._latestFilter = Object.assign({}, this._filter);
        }

        return new Observable<false | ILocalMapInfo[]>(
            (sub: Subscriber<false | ILocalMapInfo[]>) => {
                this._eleService
                    .invoke<TInvokeFilterLocalMaps>('FILTER_LOCAL_MAPS', {
                        q: this._latestFilter?.q,
                        page: this._page
                    })
                    .then(result => {
                        try {
                            if (result instanceof Array) {
                                this._canLoadMore = result.length > 0;
                                if (more && this.searchResult instanceof Array) {
                                    this.searchResult = [...this.searchResult, ...result];
                                } else {
                                    this.searchResult = result;
                                }
                            } else if (result instanceof Error) throw result;
                            else {
                                this.searchResult = false;
                            }
                            sub.next(this.searchResult);
                            sub.complete();
                        } catch (error) {
                            sub.error(error);
                        }
                    })
                    .catch(error => sub.error(error));
            }
        );
    }
}
