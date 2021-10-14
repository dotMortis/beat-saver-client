import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TSettings } from '../../../../models/settings.model';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SettingsService } from '../../../services/root.provided/settings.service';
import { SongCardService } from '../../modules/song-card/song-card.service';

@Component({
    selector: 'app-local-maps',
    templateUrl: './local-maps.component.html',
    styleUrls: ['./local-maps.component.scss']
})
export class LocalMapsComponent extends UnsubscribeComponent implements OnInit {
    paginated: boolean;
    first: number;
    totalRecords: number;

    constructor(
        public localMapsService: LocalMapsService,
        private _settingsService: SettingsService,
        private _songCardService: SongCardService,
        private _notify: NotifyService
    ) {
        super(_notify);
        this.paginated = true;
        this.first = 0;
        this.totalRecords = 0;
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings | undefined) => {
                    if (settings) {
                        if (this.paginated !== settings.localsPaginated.value) {
                            this.paginated = settings.localsPaginated.value;
                            this.onSearch(false);
                        }
                        this._setCardSettings(settings);
                    }
                })
            )
        );
        if (!this.localMapsService.searchResult || this.localMapsService.searchResult.length === 0)
            this.onSearch(false);
    }

    onSearch(more: boolean | number): void {
        if (typeof more === 'number') {
            this.addSub(
                this.localMapsService
                    .getListPaginated(more, false)
                    .pipe(tap(result => (this.totalRecords = result !== false ? result.count : 0)))
            );
        } else {
            this.first = 0;
            this.addSub(
                this.localMapsService
                    .getListInfinite(more)
                    .pipe(tap(result => (this.totalRecords = result !== false ? result.count : 0)))
            );
        }
    }

    private _setCardSettings(settings: TSettings) {
        const { value, default: defaultValue } = settings.expandAllSongCards;
        if (
            (value != null && this._songCardService.expandAll !== value) ||
            (value == null && defaultValue !== this._songCardService.expandAll)
        ) {
            this._songCardService.expandAll = value != null ? value : defaultValue;
        }
    }
}
