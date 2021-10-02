import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TMapDetail, TMapperResult, TMapVersion } from '../../../models/api/api.models';
import { TSongId } from '../../../models/maps/map-ids.model';
import { TOpenId, TOpenIdType } from '../../../models/openEvent.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: null
})
export class ContentViewerService {
    //#region SongDetailView
    private _songDetailViews: Map<TSongId, { mapDetail: TMapDetail; latestVersion: TMapVersion }>;
    get songDetailViews(): Map<TSongId, { mapDetail: TMapDetail; latestVersion: TMapVersion }> {
        return this._songDetailViews;
    }
    get songDetailViewArr(): Array<{ mapDetail: TMapDetail; latestVersion: TMapVersion }> {
        return Array.from(this._songDetailViews.values());
    }
    //#endregion

    //#region MapperDetailView
    private _mapperDetailViews: Map<number, { mapperDetail: TMapperResult }>;
    get mapperDetailViews(): Map<number, { mapperDetail: TMapperResult }> {
        return this._mapperDetailViews;
    }
    get mapperDetailViewArr(): Array<{ mapperDetail: TMapperResult }> {
        return Array.from(this._mapperDetailViews.values());
    }
    //#endregion

    public openNext?: TOpenId;
    public onOpen: Subject<TOpenId>;

    constructor(private _apiService: ApiService) {
        this._songDetailViews = new Map<
            TSongId,
            { mapDetail: TMapDetail; latestVersion: TMapVersion }
        >();
        this._mapperDetailViews = new Map<number, { mapperDetail: TMapperResult }>();
        this.onOpen = new Subject<TOpenId>();
    }

    addSongDetailView(mapDetail: TMapDetail, latestVersion: TMapVersion): void {
        if (!this._songDetailViews.has(mapDetail.id)) {
            this._songDetailViews.set(mapDetail.id, { mapDetail, latestVersion });
            this.openNext = { type: 'map', id: mapDetail.id };
        } else {
            this.onOpen.next({ type: 'map', id: mapDetail.id });
        }
    }

    addMapperDetailView(mapperInfo: { id: number }): void;
    addMapperDetailView(mapperInfo: { mapperResult: TMapperResult }): void;
    addMapperDetailView(mapperInfo: { mapperResult?: TMapperResult; id?: number }): void {
        const { id, mapperResult } = mapperInfo;
        if (id) {
            this._apiService
                .getMappperById(id)
                .pipe(tap((mapper: TMapperResult) => this._addMapperDetailView(mapper)))
                .subscribe();
        } else if (mapperResult) this._addMapperDetailView(mapperResult);
    }

    delDetailView(id: TOpenId): void {
        switch (id.type) {
            case 'map': {
                if (this._songDetailViews.has(id.id)) this._songDetailViews.delete(id.id);
                break;
            }
            case 'mapper': {
                if (this._mapperDetailViews.has(id.id)) this._mapperDetailViews.delete(id.id);
                break;
            }
            default: {
                break;
            }
        }
    }

    clearDetailViews(types: TOpenIdType[]): void {
        for (const type of types) {
            switch (type) {
                case 'map': {
                    this._songDetailViews.clear();
                    break;
                }
                case 'mapper': {
                    this._mapperDetailViews.clear();
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

    private _addMapperDetailView(mapperDetail: TMapperResult): void {
        if (!this._mapperDetailViews.has(mapperDetail.id)) {
            this._mapperDetailViews.set(mapperDetail.id, { mapperDetail });
            this.openNext = { type: 'mapper', id: mapperDetail.id };
        } else {
            this.onOpen.next({ type: 'mapper', id: mapperDetail.id });
        }
    }
}
