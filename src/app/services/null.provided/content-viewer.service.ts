import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TMapDetail, TMapperListResult, TMapVersion } from '../../../models/api/api.models';
import { TSongId } from '../../../models/maps/map-ids.model';
import { TOpenId, TOpenIdType } from '../../../models/openEvent.model';

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
    private _mapperDetailViews: Map<number, { mapperDetail: TMapperListResult }>;
    get mapperDetailViews(): Map<number, { mapperDetail: TMapperListResult }> {
        return this._mapperDetailViews;
    }
    get mapperDetailViewArr(): Array<{ mapperDetail: TMapperListResult }> {
        return Array.from(this._mapperDetailViews.values());
    }
    //#endregion

    public openNext?: TOpenId;
    public onOpen: Subject<TOpenId>;

    constructor() {
        this._songDetailViews = new Map<
            TSongId,
            { mapDetail: TMapDetail; latestVersion: TMapVersion }
        >();
        this._mapperDetailViews = new Map<number, { mapperDetail: TMapperListResult }>();
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

    addMapperDetailView(mapperDetail: TMapperListResult): void {
        if (!this._mapperDetailViews.has(mapperDetail.id)) {
            this._mapperDetailViews.set(mapperDetail.id, { mapperDetail });
            this.openNext = { type: 'mapper', id: mapperDetail.id };
        } else {
            this.onOpen.next({ type: 'mapper', id: mapperDetail.id });
        }
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
}
