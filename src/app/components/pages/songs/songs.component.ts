import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendError } from '../../../../models/electron/send.channels';
import { TSettings } from '../../../../models/settings.model';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
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
        private _tourService: TourService
    ) {
        super();
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings) => this._setCardSettings(settings))
            )
        );
        this.addSub(
            this.apiService.tSearchResultChange.pipe(
                tap(r => {
                    if (r?.docs.length) this._tourService.startCardTour(r.docs[0].id);
                })
            )
        );
        this._setCardSettings(this._settingsService.settings);
        //this.onSearch();
    }

    onSearch(more: boolean = false): void {
        this.apiService
            .getList(more)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
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
