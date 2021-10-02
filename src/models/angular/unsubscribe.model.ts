import { Component, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotifyService } from '../../app/services/root.provided/notify.service';

@Component({ template: '' })
export abstract class UnsubscribeComponent implements OnDestroy {
    private __sub: Subscription[];

    constructor(public notify: NotifyService) {
        this.__sub = new Array<Subscription>();
    }

    addSub(obs: Observable<any>): Subscription {
        const sub = obs
            .pipe(
                catchError((err: any) => {
                    this.notify.error({ title: 'Oh :/', error: err });
                    return of(null);
                })
            )
            .subscribe();
        this.__sub.push(sub);
        return sub;
    }

    ngOnDestroy(): void {
        for (const sub of this.__sub) {
            sub.unsubscribe();
        }
    }

    isNumber(value: any): boolean {
        return typeof value === 'number';
    }
}
