import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TSettings } from '../../../../models/settings.model';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { SettingsService } from '../../../services/root.provided/settings.service';
import { SongCardService } from '../../modules/song-card/song-card.service';

@Component({
    selector: 'app-local-maps',
    templateUrl: './local-maps.component.html',
    styleUrls: ['./local-maps.component.scss']
})
export class LocalMapsComponent extends UnsubscribeComponent implements OnInit {
    constructor(
        public localMapsService: LocalMapsService,
        private _settingsService: SettingsService,
        private _songCardService: SongCardService
    ) {
        super();
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings) => this._setCardSettings(settings))
            )
        );
        this._setCardSettings(this._settingsService.settings);
        if (!this.localMapsService.searchResult || !this.localMapsService.searchResult.length)
            this.onSearch(false);
    }

    onSearch(more: boolean): void {
        this.addSub(this.localMapsService.getList(more));
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
