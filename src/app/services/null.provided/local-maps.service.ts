import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { TMapDetail } from '../../../models/api/api.models';
import { TFileLoaded } from '../../../models/electron/file-loaded.model';
import {
    TInvokeFilterLocalMaps,
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../../models/electron/invoke.channels';
import { TSendDebug } from '../../../models/electron/send.channels';
import { LocalMapsFilter } from '../../../models/maps/local-maps-filter.model';
import { ILocalMapInfo } from '../../../models/maps/localMapInfo.model';
import { TSongId } from '../../../models/maps/map-ids.model';
import { ElectronService } from '../root.provided/electron.service';
import { NotifyService } from '../root.provided/notify.service';

@Injectable({
    providedIn: null
})
export class LocalMapsService {
    public installedSongsReloaded: EventEmitter<void>;
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
        this.installedSongsReloaded = new EventEmitter<void>();
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
        this._notify.errorFileHandle(result, 'BS Installation');
        this.installedSongsReloaded.next();
        return result;
    }

    public addMapDetailCache(tMapDetail: TMapDetail): void {
        if (!this._tMapDetailCache.has(tMapDetail.id))
            this._tMapDetailCache.set(tMapDetail.id, tMapDetail);
    }

    public getMapDetailCache(id: TSongId): TMapDetail | undefined {
        return this._tMapDetailCache.get(id);
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
                        q:
                            this._latestFilter != null && this._latestFilter.q
                                ? `%${this._latestFilter.q}%`
                                : undefined,
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
