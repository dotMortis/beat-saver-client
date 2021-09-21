import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TMapDetail, TMapVersion } from '../../../models/api/api.models';
import { TSongId } from '../../../models/maps/map-ids.model';

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

    public openNext?: TSongId;
    public onOpen: Subject<TSongId>;

    constructor() {
        this._songDetailViews = new Map<
            TSongId,
            { mapDetail: TMapDetail; latestVersion: TMapVersion }
        >();
        this.onOpen = new Subject<TSongId>();
    }

    addSongDetailView(mapDetail: TMapDetail, latestVersion: TMapVersion): void {
        if (!this._songDetailViews.has(mapDetail.id)) {
            this._songDetailViews.set(mapDetail.id, { mapDetail, latestVersion });
            this.openNext = mapDetail.id;
        } else {
            this.onOpen.next(mapDetail.id);
        }
    }

    delSongDetailView(mapDetail: TMapDetail): void {
        if (this._songDetailViews.has(mapDetail.id)) this._songDetailViews.delete(mapDetail.id);
    }

    clearSongDetailViews(): void {
        this._songDetailViews.clear();
    }
}
