import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {
    public onScrollTop: Subject<void>;

    constructor() {
        this.onScrollTop = new Subject<void>();
    }

    scrollTop(): void {
        this.onScrollTop.next();
    }
}
