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
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings) => this._setCardSettings(settings))
            )
        );
        this.addSub(
            this.apiService.tMapSearchResultChange.pipe(
                tap(r => {
                    if (r?.docs.length) this._tourService.startCardTour(r.docs[0].id);
                })
            )
        );
        this._setCardSettings(this._settingsService.settings);
        if (!this.apiService.tMapSearchResult) this.onSearch();
    }

    onSearch(more: boolean = false): void {
        this.apiService
            .getMapList(more)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this._eleService.send<TSendError>('ERROR', error);
                    return EMPTY;
                })
            )
            .subscribe();
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
