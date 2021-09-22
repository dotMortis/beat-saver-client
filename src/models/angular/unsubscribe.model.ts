import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({ template: '' })
export abstract class UnsubscribeComponent implements OnDestroy {
    private __sub: Subscription[];

    constructor() {
        this.__sub = new Array<Subscription>();
    }

    addSub(obs: Observable<any>): Subscription {
        const sub = obs.subscribe();
        this.__sub.push(sub);
        return sub;
    }

    ngOnDestroy(): void {
        for (const sub of this.__sub) {
            sub.unsubscribe();
        }
    }
}
