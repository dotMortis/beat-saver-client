import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TSendError } from '../../../../models/electron/send.channels';
import { TSettings } from '../../../../models/settings.model';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SettingsService } from '../../../services/root.provided/settings.service';
import { TourService } from '../../../services/root.provided/tour.service';
import { SongCardService } from '../../modules/song-card/song-card.service';

@Component({
    selector: 'app-songs',
    templateUrl: './songs.component.html',
    styleUrls: ['./songs.component.scss']
})
export class SongsComponent extends UnsubscribeComponent implements OnInit {
    first: number;
    paginated: boolean;

    constructor(
        public apiService: ApiService,
        public dlService: DlService,
        private _eleService: ElectronService,
        private _settingsService: SettingsService,
        private _songCardService: SongCardService,
        private _tourService: TourService,
        private _notify: NotifyService
    ) {
        super(_notify);
        this.first = 0;
        this.paginated = true;
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings | undefined) => {
                    if (settings) {
                        if (this.paginated !== settings.beatSaverPaginated.value) {
                            this.paginated = settings.beatSaverPaginated.value;
                            this.onSearch(false);
                        }
                        this._setCardSettings(settings);
                    }
                })
            )
        );
        this.addSub(
            this.apiService.tMapSearchResultChange.pipe(
                tap(r => {
                    if (r?.docs.length) this._tourService.startCardTour(r.docs[0].id);
                })
            )
        );
        if (!this.apiService.tMapSearchResult) this.onSearch();
    }

    onSearch(more: boolean | number = false): void {
        if (typeof more === 'number') {
            this.apiService
                .getMapListPaginated(more, false)
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        this._eleService.send<TSendError>('ERROR', error);
                        return EMPTY;
                    })
                )
                .subscribe();
        } else {
            this.first = 0;
            this.apiService
                .getMapListInfinite(more)
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        this._eleService.send<TSendError>('ERROR', error);
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }

    private _setCardSettings(settings: TSettings | undefined) {
        if (settings) {
            const { value, default: defaultValue } = settings.expandAllSongCards;
            if (
                (value != null && this._songCardService.expandAll !== value) ||
                (value == null && defaultValue !== this._songCardService.expandAll)
            ) {
                this._songCardService.expandAll = value != null ? value : defaultValue;
            }
        }
    }
}
