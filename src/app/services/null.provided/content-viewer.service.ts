import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TMapDetail, TMapVersion } from '../../../models/api/api.models';
import { TSongId } from '../../../models/maps/map-ids.model';
import { TOpenId } from '../../../models/openEvent.model';

@Injectable({
    providedIn: null
})
export class ContentViewerService {
    private _songDetailViews: Map<TSongId, { mapDetail: TMapDetail; latestVersion: TMapVersion }>;
    get songDetailViews(): Map<TSongId, { mapDetail: TMapDetail; latestVersion: TMapVersion }> {
        return this._songDetailViews;
    }

    get songDetailViewArr(): Array<{ mapDetail: TMapDetail; latestVersion: TMapVersion }> {
        return Array.from(this._songDetailViews.values());
    }

    public openNext?: TOpenId;
    public onOpen: Subject<TOpenId>;

    constructor() {
        this._songDetailViews = new Map<
            TSongId,
            { mapDetail: TMapDetail; latestVersion: TMapVersion }
        >();
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

    delSongDetailView(mapDetail: TMapDetail): void {
        if (this._songDetailViews.has(mapDetail.id)) this._songDetailViews.delete(mapDetail.id);
    }

    clearSongDetailViews(): void {
        this._songDetailViews.clear();
    }
}
