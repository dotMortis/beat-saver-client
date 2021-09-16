import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: null
})
export class LocalSongCardService {
    private _expandAll: boolean;
    get expandAll(): boolean {
        return this._expandAll;
    }
    set expandAll(val: boolean) {
        if (val !== this._expandAll) {
            this._expandAll = val;
            this.expandAllChange.next(this._expandAll);
        }
    }
    expandAllChange: BehaviorSubject<boolean>;

    constructor() {
        this._expandAll = false;
        this.expandAllChange = new BehaviorSubject<boolean>(false);
    }
}
