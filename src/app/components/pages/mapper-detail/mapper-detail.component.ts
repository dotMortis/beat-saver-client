import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TMapDetail, TMapperResult, TMapSearchResult } from '../../../../models/api/api.models';
import { TSendEmitDownload, TSendError } from '../../../../models/electron/send.channels';
import { TSettings } from '../../../../models/settings.model';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SettingsService } from '../../../services/root.provided/settings.service';
import { SongCardService } from '../../modules/song-card/song-card.service';

@Component({
    selector: 'app-mapper-detail',
    templateUrl: './mapper-detail.component.html',
    styleUrls: ['./mapper-detail.component.scss']
})
export class MapperDetailComponent extends UnsubscribeComponent implements OnInit {
    private _mapper!: TMapperResult;
    @Input()
    get mapper(): TMapperResult {
        return this._mapper;
    }
    set mapper(val: TMapperResult) {
        if (val.id !== this._mapper?.id) {
            this._mapper = val;
        }
    }
    get totalRecords(): number {
        return this.mapper?.stats.totalMaps || Infinity;
    }

    paginated: boolean;

    first: number;

    mapDetails: TMapDetail[];

    canLoadMore: boolean;

    latestPage: number;

    constructor(
        public dlService: DlService,
        private _apiService: ApiService,
        private _eleService: ElectronService,
        private _settingsService: SettingsService,
        private _songCardService: SongCardService,
        private _notify: NotifyService
    ) {
        super(_notify);
        this.first = 0;
        this.latestPage = 0;
        this.canLoadMore = true;
        this.paginated = true;
        this.mapDetails = new Array<TMapDetail>();
    }

    ngOnInit(): void {
        this.addSub(
            this._settingsService.settingsChange.pipe(
                tap((settings: TSettings | undefined) => {
                    console.log(settings);

                    if (settings) {
                        if (this.paginated !== settings.mapperPaginated.value) {
                            this.paginated = settings.mapperPaginated.value;
                            this.onSearch(false);
                        }
                        this._setCardSettings(settings);
                    }
                })
            )
        );
        this.onSearch(false);
    }

    onSearch(page: number | boolean): void {
        if (typeof page === 'number') {
            this.latestPage = page;
        } else if (page === true) {
            this.latestPage++;
        } else {
            this.latestPage = 0;
            this.first = 0;
        }
        this._apiService
            .getPaginatedMapListByMapper(this.mapper.id, this.latestPage)
            .pipe(
                tap((result: TMapSearchResult) => {
                    if (result.docs.length) {
                        this.canLoadMore = true;
                        if (!this.paginated && page !== false) {
                            this.mapDetails.push(...result.docs);
                        } else this.mapDetails = result.docs;
                    } else this.canLoadMore = false;
                }),
                catchError((error: HttpErrorResponse) => {
                    this._eleService.send<TSendError>('ERROR', error);
                    return EMPTY;
                })
            )
            .subscribe();
    }

    onDownloadPlaylist(): void {
        if (this.mapper)
            this._eleService.send<TSendEmitDownload>(
                'EMIT_DOWNLOAD',
                `https://beatsaver.com/api/users/id/${this.mapper.id}/playlist`
            );
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
