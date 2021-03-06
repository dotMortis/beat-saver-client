import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import {
    ECharacteristic,
    TMapDetail,
    TMapDifficulty,
    TMapVersion
} from '../../../../models/api/api.models';
import { TBoardIdent } from '../../../../models/api/leaderboard.model';
import { TInstalled } from '../../../../models/electron/download.model';
import {
    TSendDebug,
    TSendEmitDownload,
    TSendError
} from '../../../../models/electron/send.channels';
import { MapsHelpers } from '../../../../models/maps/maps.helpers';
import { TLevelStatsData } from '../../../../models/player/player-data.model';
import { ApiService } from '../../../services/null.provided/api.service';
import { ContentViewerService } from '../../../services/null.provided/content-viewer.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SongPreviewService } from '../dashboard/song-preview/song-preview.service';

@Component({
    selector: 'app-songs-detail',
    templateUrl: './songs-detail.component.html',
    styleUrls: ['./songs-detail.component.scss'],
    providers: [ConfirmationService]
})
export class SongsDetailComponent extends UnsubscribeComponent implements OnInit {
    private _songId?: string;
    @Input()
    get songId(): string | undefined {
        return this._songId;
    }
    set songId(val: string | undefined) {
        if (val !== this._songId) this._songId = val;
    }

    private _tMapDetail?: TMapDetail;
    get tMapDetail(): TMapDetail | undefined {
        return this._tMapDetail;
    }
    set tMapDetail(val: TMapDetail | undefined) {
        this._tMapDetail = val;
    }

    public groupedLevelStatsData?: Map<ECharacteristic, TLevelStatsData[]> | undefined;
    private _isInstalledSong: { status: TInstalled };
    get isInstalledSong(): boolean {
        return this._isInstalledSong.status === 'INSTALLED';
    }
    public latestVersion?: TMapVersion;
    public uploadTimeInfo?: string | Date;

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

    private _songNameShort: string;
    get songNameShort(): string {
        if (this._songNameShort === 'N/A' && this.tMapDetail?.name) {
            this._songNameShort =
                this.tMapDetail.name.length > 70
                    ? `${this.tMapDetail?.name.slice(0, 70)}...`
                    : this.tMapDetail?.name || 'N/A';
        }
        return this._songNameShort;
    }
    get songName(): string {
        return this.tMapDetail?.name || 'N/A';
    }

    get inQueue(): boolean {
        if (this.latestVersion) return this.dlService.has(this.latestVersion);
        else return false;
    }

    public isFav: boolean;

    public boardIdent: BehaviorSubject<TBoardIdent | undefined>;

    private _isDeleted: boolean;
    get isDeleted(): boolean {
        return this._isDeleted && !this._isInstalledSong;
    }
    set isDeleted(val: boolean) {
        if (this._isDeleted !== val) {
            this._isDeleted = val;
        }
    }

    constructor(
        public apiService: ApiService,
        public songPreviewService: SongPreviewService,
        public playerStatsService: PlayerStatsService,
        public installedSongsService: LocalMapsService,
        public dlService: DlService,
        private _eleService: ElectronService,
        private _notify: NotifyService,
        private _clipboard: Clipboard,
        private _confirmService: ConfirmationService,
        private _cvService: ContentViewerService
    ) {
        super(_notify);
        this.boardIdent = new BehaviorSubject<TBoardIdent | undefined>(undefined);
        this._isInstalledSong = { status: false };
        this._songNameShort = 'N/A';
        this.isFav = false;
        this._isDeleted = false;
    }

    ngOnInit(): void {
        if (this.songId) {
            this.addSub(
                this.apiService.getById(this.songId).pipe(
                    tap((result: TMapDetail) => (this.tMapDetail = result)),
                    tap(() => this._init())
                )
            );
        }
    }

    onPlayPreview(): void {
        this.songPreviewService.showPreview = this.latestVersion?.downloadURL;
    }

    onCardClick() {
        if (this.tMapDetail && this.latestVersion) {
            if (this.dlService.has(this.latestVersion)) {
                this.dlService.remove(this.latestVersion);
            } else {
                this.dlService.add(this.tMapDetail, this.latestVersion, this._isInstalledSong);
            }
        }
    }

    async onUninstallSong(event: Event) {
        this._confirmService.confirm({
            target: <EventTarget>event.target,
            message: 'Are you sure that you want to delete this amazing song?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const id = this.tMapDetail?.id;
                    if (id) await this.dlService.deleteSingle(id);
                    this.isDeleted = true;
                } catch (error: any) {
                    this._notify.error(error);
                }
            }
        });
    }

    onCopySRM() {
        this._clipboard.copy(`!bsr ${this.tMapDetail?.id}`);
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

    onDownloadZip() {
        try {
            if (this.latestVersion)
                this._eleService.send<TSendEmitDownload>(
                    'EMIT_DOWNLOAD',
                    this.latestVersion.downloadURL
                );
        } catch (error: any) {
            this._notify.error(error);
        }
    }

    private _init(): void {
        this.latestVersion = this.tMapDetail?.versions.sort((a: TMapVersion, b: TMapVersion) =>
            a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1
        )[this.tMapDetail.versions.length - 1];
        if (this.latestVersion != null) {
            this.diffs = MapsHelpers.getDifficultyGroupedByChar(this.latestVersion);
            this._setUploadTimeInfo(this.latestVersion.createdAt);
            this._loadPlayerSongStats()
                .catch(error => this._eleService.send<TSendError>('ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.playerStatsService.selectedPlayerChange.pipe(
                            mergeMap(async (result: { name: string } | undefined) => {
                                try {
                                    if (result) {
                                        await this._loadPlayerSongStats();
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
                                    await this._loadPlayerSongStats();
                                } catch (error: any) {
                                    this._eleService.send<TSendError>('ERROR', error);
                                }
                            })
                        )
                    );
                });

            this._initIsInstalledSong().catch(error =>
                this._eleService.send<TSendError>('ERROR', error)
            );
        }
    }

    onDiffSelected(diff: TMapDifficulty | undefined): void {
        if (this.latestVersion && diff && this._tMapDetail) {
            this.boardIdent.next({
                hash: this.latestVersion.hash,
                difficulty: diff
            });
        } else {
            this.boardIdent.next(undefined);
        }
    }

    onOpenMapper(): void {
        if (this.tMapDetail)
            this._cvService.addMapperDetailView({ id: this.tMapDetail.uploader.id });
    }

    private async _loadPlayerSongStats(): Promise<void> {
        if (this.latestVersion?.hash) {
            const tLevelStatsInfo = await this.playerStatsService
                .loadPlayerSongStats(this.latestVersion.hash)
                .toPromise()
                .catch(error => {
                    this._eleService.send<TSendError>('ERROR', error);
                });
            this._eleService.send<TSendDebug>('DEBUG', {
                msg: 'LEVELSTATSINFO',
                meta: tLevelStatsInfo
            });
            if (tLevelStatsInfo && tLevelStatsInfo.result) {
                this.groupedLevelStatsData = MapsHelpers.getPlayerLevelStatsGroupedByChar(
                    tLevelStatsInfo.result
                );
                this.isFav = tLevelStatsInfo.result.isFav;
            } else {
                this.groupedLevelStatsData = undefined;
                this.isFav = false;
            }
        }
    }

    private async _initIsInstalledSong(): Promise<void> {
        if (this.tMapDetail) {
            this.addSub(
                this.installedSongsService.songInstallChange.pipe(
                    filter(data => data.songId === this.tMapDetail?.id),
                    tap(
                        data =>
                            (this._isInstalledSong = {
                                status: data.installed ? 'INSTALLED' : false
                            })
                    )
                )
            );
            const result = await this.installedSongsService
                .songIsInstalled(this.tMapDetail?.id)
                .catch(error => {
                    this._eleService.send<TSendError>('ERROR', error);
                });
            this._isInstalledSong = { status: result && result.result ? 'INSTALLED' : false };
        }
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
