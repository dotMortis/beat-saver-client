import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import {
    ECharacteristic,
    TMapDetail,
    TMapDifficulty,
    TMapVersion
} from '../../../../models/api/api.models';
import { TInstalled } from '../../../../models/electron/download.model';
import { TInvokeGetLocalCover } from '../../../../models/electron/invoke.channels';
import { TSendDebug, TSendError } from '../../../../models/electron/send.channels';
import { ILocalMapInfo } from '../../../../models/maps/localMapInfo.model';
import { TSongHash, TSongId } from '../../../../models/maps/map-ids.model';
import { ApiHelpers } from '../../../../models/maps/maps.helpers';
import { TLevelStatsData } from '../../../../models/player/player-data.model';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SongPreviewService } from '../../pages/dashboard/song-preview/song-preview.service';
import { SongCardService } from './song-card.service';

@Component({
    selector: 'app-song-card',
    templateUrl: './song-card.component.html',
    styleUrls: ['./song-card.component.scss'],
    providers: [ConfirmationService]
})
export class SongCardComponent extends UnsubscribeComponent implements OnInit {
    @Input() localMode: boolean;
    @Input() tMapDetail?: TMapDetail;
    @Input() localMapInfo?: ILocalMapInfo;
    @Output() mapDeleted: EventEmitter<boolean>;
    public tGroupedLevelStatsData?: Map<ECharacteristic, TLevelStatsData[]>;
    private _isInstalledSong: { status: TInstalled };
    get isInstalledSong(): boolean {
        return this._isInstalledSong.status === 'INSTALLED';
    }
    public latestVersion?: TMapVersion;
    public uploadTimeInfo?: string | Date;

    private _expanded: boolean;
    get expanded(): boolean {
        return this._expanded && this.tMapDetail != null;
    }
    set expanded(value: boolean) {
        if (value !== this._expanded) this._expanded = value;
    }

    private _diffs?: Map<ECharacteristic, TMapDifficulty[]>;
    get diffs(): Map<ECharacteristic, TMapDifficulty[]> | undefined {
        return this._diffs;
    }
    set diffs(value: Map<ECharacteristic, TMapDifficulty[]> | undefined) {
        this._diffs = value;
        this._diffsArr = this._diffs ? Array.from(this._diffs) : undefined;
    }
    private _diffsArr?: Array<[ECharacteristic, TMapDifficulty[]]>;
    get diffsArr(): Array<[ECharacteristic, TMapDifficulty[]]> | undefined {
        return this._diffsArr;
    }

    get localSongName(): string {
        return this.localMapInfo
            ? `${this.localMapInfo.song_name} ${this.localMapInfo.song_sub_name || ''} - ${
                  this.localMapInfo.song_author_name
              }`
            : 'N/A';
    }
    get songName(): string {
        return this.tMapDetail?.name || this.localSongName;
    }
    private _songNameShort: string;
    get songNameShort(): string {
        if (this._songNameShort === 'N/A' && this.songName !== 'N/A') {
            this._songNameShort =
                this.songName.length > 70 ? `${this.songName.slice(0, 70)}...` : this.songName;
        }
        return this._songNameShort;
    }

    get mapperName(): string {
        return this.tMapDetail?.uploader?.name || this.localMapInfo?.level_author_name || 'N/A';
    }

    get inQueue(): boolean {
        if (this.latestVersion) return this.dlService.has(this.latestVersion);
        else return false;
    }

    private _coverUrl: string;
    get coverUrl(): string {
        return this.latestVersion?.coverURL || this._coverUrl;
    }

    public isFav: boolean;

    public loading: boolean;

    public id?: TSongId;

    private _isDeleted: boolean;
    get isDeleted(): boolean {
        return this._isDeleted && !this._isInstalledSong?.status;
    }
    set isDeleted(val: boolean) {
        if (this._isDeleted !== val) {
            this._isDeleted = val;
            this.mapDeleted.next(val);
        }
    }

    constructor(
        public songPreviewService: SongPreviewService,
        public playerStatsService: PlayerStatsService,
        public installedSongsService: LocalMapsService,
        public dlService: DlService,
        private _eleService: ElectronService,
        private _notify: NotifyService,
        private _clipboard: Clipboard,
        private _songCardService: SongCardService,
        private _apiService: ApiService,
        private _localMapsService: LocalMapsService,
        private _confirmService: ConfirmationService
    ) {
        super();
        this.mapDeleted = new EventEmitter<boolean>();
        this._isInstalledSong = { status: false };
        this._songNameShort = 'N/A';
        this._expanded = this._songCardService.expandAll;
        this.localMode = false;
        this.loading = true;
        this.isFav = false;
        this._isDeleted = false;
        this._coverUrl = 'assets/bs-default.jpeg';
    }

    ngOnInit(): void {
        this.addSub(
            this._songCardService.expandAllChange.pipe(
                tap((val: boolean) => {
                    if (this._expanded !== val) this.expanded = val;
                })
            )
        );

        if (!this.localMode && this.tMapDetail) this._init(this.tMapDetail);
        else if (this.localMapInfo) {
            const tempTMapDetails = this._localMapsService.getMapDetailCache(this.localMapInfo.id);
            if (tempTMapDetails) this._init(tempTMapDetails);
            else {
                this.addSub(
                    this._apiService.getById(this.localMapInfo.id).pipe(
                        tap((tMapDetail: TMapDetail) => {
                            this._localMapsService.addMapDetailCache(tMapDetail);
                            this._init(tMapDetail);
                        }),
                        catchError(() => {
                            this._init(undefined);
                            return of(null);
                        })
                    )
                );
            }
        }
    }

    onPlayPreview(): void {
        this.songPreviewService.showPreview = this.latestVersion?.downloadURL;
    }

    onCardClick() {
        if (!this.localMode && this.tMapDetail && this.latestVersion) {
            if (this.dlService.has(this.latestVersion)) {
                this.dlService.remove(this.latestVersion);
            } else {
                this.dlService.add(this.tMapDetail, this.latestVersion, this._isInstalledSong);
            }
        }
    }

    onCopySRM() {
        this._clipboard.copy(`!bsr ${this.id}`);
    }

    async onDownloadSingle() {
        try {
            if (this.tMapDetail && this.latestVersion) {
                const dlInfo = this.dlService.add(
                    this.tMapDetail,
                    this.latestVersion,
                    this._isInstalledSong
                );
                await this.dlService.installSingle(dlInfo);
            }
        } catch (error: any) {
            this._notify.error(error);
        }
    }

    async onUninstallSong(event: Event) {
        this._confirmService.confirm({
            target: <EventTarget>event.target,
            message: 'Are you sure that you want to delete this amazing song?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const id = this.tMapDetail?.id || this.localMapInfo?.id;
                    if (id) await this.dlService.deleteSingle(id);
                    this.isDeleted = true;
                } catch (error: any) {
                    this._notify.error(error);
                }
            }
        });
    }

    private async _init(tMapDetail: TMapDetail | undefined): Promise<void> {
        this.tMapDetail = tMapDetail;
        this.latestVersion = tMapDetail?.versions.sort((a: TMapVersion, b: TMapVersion) =>
            a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1
        )[tMapDetail.versions.length - 1];
        if (this.latestVersion != null) {
            this.diffs = ApiHelpers.getDifficultyGroupedByChar(this.latestVersion);
            this._setUploadTimeInfo(this.latestVersion.createdAt);
        }
        const hash = this.latestVersion?.hash || this.localMapInfo?.hash;
        this.id = tMapDetail?.id || this.localMapInfo?.id;
        if (hash) {
            this._loadPlayerSongStats(hash)
                .catch((error: any) => this._eleService.send<TSendError>('ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.playerStatsService.selectedPlayerChange.pipe(
                            mergeMap(async (result: { name: string } | undefined) => {
                                try {
                                    if (result) {
                                        await this._loadPlayerSongStats(hash);
                                    }
                                } catch (error: any) {
                                    this._eleService.send<TSendError>('ERROR', error);
                                }
                            })
                        )
                    );
                    this.addSub(
                        this.playerStatsService.playerStatsReloaded.pipe(
                            mergeMap(async () => {
                                try {
                                    await this._loadPlayerSongStats(hash);
                                } catch (error: any) {
                                    this._eleService.send<TSendError>('ERROR', error);
                                }
                            })
                        )
                    );
                });
        }
        if (this.id) {
            this._initIsInstalledSong(this.id)
                .catch(error => this._eleService.send<TSendError>('ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.installedSongsService.installedSongsReloaded.pipe(
                            mergeMap(async () => {
                                try {
                                    if (this.id) await this._initIsInstalledSong(this.id);
                                } catch (error: any) {
                                    this._eleService.send<TSendError>('ERROR', error);
                                }
                            })
                        )
                    );
                });
            if (!tMapDetail) {
                const imageBuffer = await this._eleService.invoke<TInvokeGetLocalCover>(
                    'GET_LOCAL_COVER',
                    { id: this.id }
                );
                if (imageBuffer instanceof Error) {
                    this._eleService.send<TSendError>('ERROR', imageBuffer);
                } else if (imageBuffer) {
                    this._coverUrl = 'data:image/jpg;base64, ' + imageBuffer;
                }
            }
        }

        this.loading = false;
    }

    private async _loadPlayerSongStats(hash: TSongHash): Promise<void> {
        const tLevelStatsInfo = await this.playerStatsService
            .loadPlayerSongStats(hash)
            .toPromise()
            .catch(error => {
                this._eleService.send<TSendError>('ERROR', error);
            });
        this._eleService.send<TSendDebug>('DEBUG', {
            msg: 'LEVELSTATSINFO',
            meta: tLevelStatsInfo
        });
        if (tLevelStatsInfo && tLevelStatsInfo.result) {
            this.isFav = tLevelStatsInfo.result.isFav;
            this.tGroupedLevelStatsData = ApiHelpers.getPlayerLevelStatsGroupedByChar(
                tLevelStatsInfo.result
            );
        } else {
            this.isFav = false;
            this.tGroupedLevelStatsData = undefined;
        }
    }

    private async _initIsInstalledSong(id: TSongId): Promise<void> {
        const result = await this.installedSongsService.songIsInstalled(id).catch(error => {
            this._eleService.send<TSendError>('ERROR', error);
        });
        this._isInstalledSong = { status: result && result.result ? 'INSTALLED' : false };
    }

    private _setUploadTimeInfo(isoString: string): void {
        const uploadDate = new Date(isoString);
        const difInHours = (Date.now() - uploadDate.getTime()) / 1000 / 60 / 60;
        if (difInHours < 1) {
            this.uploadTimeInfo = '< 1 hour ago';
        } else if (difInHours < 2) {
            this.uploadTimeInfo = `${Math.round(difInHours)} hour ago`;
        } else if (difInHours < 24) {
            this.uploadTimeInfo = `${Math.round(difInHours)} hours ago`;
        } else {
            this.uploadTimeInfo = uploadDate.toLocaleDateString();
        }
    }
}
