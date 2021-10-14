import { Injectable } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { TMapDetail } from '../../../models/api/api.models';
import { TFileLoaded } from '../../../models/electron/file-loaded.model';
import {
    TInvokeFilterLocalMaps,
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../../models/electron/invoke.channels';
import { TSendDebug, TSendMapInstallChange } from '../../../models/electron/send.channels';
import { LocalMapsFilter } from '../../../models/maps/local-maps-filter.model';
import { ILocalMapInfo } from '../../../models/maps/localMapInfo.model';
import { TSongId } from '../../../models/maps/map-ids.model';
import { ElectronService } from '../root.provided/electron.service';
import { NotifyService } from '../root.provided/notify.service';

@Injectable({
    providedIn: null
})
export class LocalMapsService {
    public songInstallChange: Observable<{ songId: TSongId; installed: boolean }>;
    private readonly _filter: LocalMapsFilter;
    private _latestFilter?: LocalMapsFilter;
    private _page: number;
    private _tMapDetailCache: Map<TSongId, TMapDetail>;

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

    constructor(private _eleService: ElectronService, private _notify: NotifyService) {
        this.songInstallChange = this._eleService.on<TSendMapInstallChange>('MAP_INSTALL_CHANGED');
        this._filter = new LocalMapsFilter({});
        this._page = 0;
        this._canLoadMore = true;
        this._searchResult = [];
        this.searchResultChange = new Subject<ILocalMapInfo[] | false>();
        this._tMapDetailCache = new Map<TSongId, TMapDetail>();
    }

    async songIsInstalled(
        songId: TSongId
    ): Promise<false | { result: boolean | undefined; status: TFileLoaded }> {
        const result = await this._eleService.invoke<TInvokeIsInstalled>('SONG_IS_INSTALLED', {
            mapId: songId
        });
        if (result instanceof Error) {
            this._notify.error({ error: result, title: 'Check Song is Installed' });
            throw result;
        }
        this._notify.errorFileHandle(result, 'BS Installation');
        return result;
    }

    async loadInstalledSongs(): Promise<false | { status: TFileLoaded }> {
        this._eleService.send<TSendDebug>('DEBUG', {
            msg: 'loadInstalledSongs'
        });
        const result = await this._eleService.invoke<TInvokeLoadInstalledSongs>(
            'LOAD_INSTALLED_STATS',
            undefined
        );
        if (result instanceof Error) {
            this._notify.error({ error: result, title: 'Load Installed Songs' });
            throw result;
        }
        this._notify.errorFileHandle(result, 'BS Installation');
        return result;
    }

    public addMapDetailCache(tMapDetail: TMapDetail): void {
        if (!this._tMapDetailCache.has(tMapDetail.id))
            this._tMapDetailCache.set(tMapDetail.id, tMapDetail);
    }

    public getMapDetailCache(id: TSongId): TMapDetail | undefined {
        return this._tMapDetailCache.get(id);
    }

    public getListInfinite(
        more: boolean
    ): Observable<false | { count: number; data: ILocalMapInfo[] }> {
        if (more) {
            this._page++;
        } else {
            this._page = 0;
            this._latestFilter = Object.assign({}, this._filter);
        }
        return new Observable<false | { count: number; data: ILocalMapInfo[] }>(
            (sub: Subscriber<false | { count: number; data: ILocalMapInfo[] }>) => {
                this._eleService
                    .invoke<TInvokeFilterLocalMaps>('FILTER_LOCAL_MAPS', {
                        q:
                            this._latestFilter != null && this._latestFilter.q
                                ? `%${this._latestFilter.q}%`
                                : undefined,
                        page: this._page
                    })
                    .then(result => {
                        try {
                            if (result instanceof Error) throw result;
                            else if (result !== false) {
                                if (more && this.searchResult instanceof Array) {
                                    this.searchResult = [...this.searchResult, ...result.data];
                                } else {
                                    this.searchResult = result.data;
                                }
                                this._canLoadMore = this.searchResult.length < result.count - 1;
                            } else {
                                this.searchResult = false;
                            }
                            sub.next(result);
                            sub.complete();
                        } catch (error) {
                            sub.error(error);
                        }
                    })
                    .catch(error => sub.error(error));
            }
        );
    }

    public getListPaginated(
        page: number,
        updateFilters: boolean
    ): Observable<false | { count: number; data: ILocalMapInfo[] }> {
        if (updateFilters) {
            this._latestFilter = Object.assign({}, this._filter);
        }
        return new Observable<false | { count: number; data: ILocalMapInfo[] }>(
            (sub: Subscriber<false | { count: number; data: ILocalMapInfo[] }>) => {
                this._eleService
                    .invoke<TInvokeFilterLocalMaps>('FILTER_LOCAL_MAPS', {
                        q:
                            this._latestFilter != null && this._latestFilter.q
                                ? `%${this._latestFilter.q}%`
                                : undefined,
                        page
                    })
                    .then(result => {
                        try {
                            if (result instanceof Error) throw result;
                            else if (result !== false) this.searchResult = result.data;
                            else this.searchResult = false;
                            sub.next(result);
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
