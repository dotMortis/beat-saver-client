import { Injectable } from '@angular/core';
import { JoyrideService } from 'ngx-joyride';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TSendError } from '../../../models/electron/send.channels';
import { TSongId } from '../../../models/maps/map-ids.model';
import { ElectronService } from './electron.service';
import { ScrollService } from './scroll.service';

@Injectable({
    providedIn: 'root'
})
export class TourService {
    get isShown(): boolean {
        return window.localStorage.getItem('tour') != null;
    }

    constructor(
        private _joyService: JoyrideService,
        private _scrollService: ScrollService,
        private _eleService: ElectronService
    ) {}

    shown(status: boolean): void {
        if (status) {
            window.localStorage.setItem('tour', 'shown');
        } else {
            window.localStorage.removeItem('tour');
        }
    }

    startCardTour(songId: TSongId): void {
        if (this.isShown) return;
        const cardStepCount = 6;
        const steps = new Array<string>();
        for (let z = 1; z <= cardStepCount; z++) {
            steps.push(`${songId}${z}`);
        }
        steps.push('dlQueue1');
        this._joyService
            .startTour({
                steps
            })
            .pipe(
                catchError(error => {
                    this._eleService.send<TSendError>('ERROR', error);
                    return EMPTY;
                }),
                finalize(() => {
                    this.shown(true);
                    this._scrollService.scrollTop();
                })
            )
            .subscribe();
    }
}
