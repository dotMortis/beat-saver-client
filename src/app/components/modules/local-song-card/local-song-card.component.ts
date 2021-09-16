import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { mergeMap, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import {
    ECharacteristic,
    TMapDetail,
    TMapDifficulty,
    TMapVersion
} from '../../../../models/api/api.models';
import { TInstalled } from '../../../../models/electron/download.model';
import { TSendDebug, TSendError } from '../../../../models/electron/send.channels';
import { ApiHelpers } from '../../../../models/maps/maps.helpers';
import { LevelStatsData, TLevelStatsInfo } from '../../../../models/player/player-data.model';
import { DlService } from '../../../services/null.provided/dl.service';
import { InstalledSongsService } from '../../../services/null.provided/installed-songs.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { SongPreviewService } from '../../pages/dashboard/song-preview/song-preview.service';
import { LocalSongCardService } from './local-song-card.service';

@Component({
    selector: 'app-local-song-card',
    templateUrl: './local-song-card.component.html',
    styleUrls: ['./local-song-card.component.scss']
})
export class LocalSongCardComponent extends UnsubscribeComponent implements OnInit {
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.isMobile = window.innerWidth < 992;
    }
    @Input() tMapDetail?: TMapDetail;
    public tLevelStatsInfo?: TLevelStatsInfo;
    public isInstalledSong: { status: TInstalled };
    public latestVersion?: TMapVersion;
    public uploadTimeInfo?: string | Date;

    private _expanded: boolean;
    @Input()
    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(value: boolean) {
        if (value !== this._expanded) this._expanded = value;
    }

    @Output()
    public expandedChange: EventEmitter<boolean>;

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

    private _isMobile: boolean;
    get isMobile(): boolean {
        return this._isMobile;
    }
    set isMobile(val: boolean) {
        if (val !== this._isMobile) this._isMobile = val;
    }

    get inQueue(): boolean {
        if (this.latestVersion) return this.dlService.has(this.latestVersion);
        else return false;
    }

    constructor(
        public songPreviewService: SongPreviewService,
        public playerStatsService: PlayerStatsService,
        public installedSongsService: InstalledSongsService,
        public dlService: DlService,
        private _eleService: ElectronService,
        private _notify: NotifyService,
        private _clipboard: Clipboard,
        private _localSongCardService: LocalSongCardService
    ) {
        super();
        this.isInstalledSong = { status: false };
        this._songNameShort = 'N/A';
        this.expandedChange = new EventEmitter<boolean>();
        this._expanded = this._localSongCardService.expandAll;
        this._isMobile = window.innerWidth < 992;
    }

    ngOnInit(): void {
        this.addSub(
            this._localSongCardService.expandAllChange.pipe(
                tap((val: boolean) => {
                    if (this.expanded !== val) this.expanded = val;
                })
            )
        );
        this.latestVersion = this.tMapDetail?.versions.sort((a: TMapVersion, b: TMapVersion) =>
            a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1
        )[this.tMapDetail.versions.length - 1];
        if (this.latestVersion != null) {
            this.diffs = ApiHelpers.getDifficultyGroupedByChar(this.latestVersion);
            this._setUploadTimeInfo(this.latestVersion.createdAt);
            this._loadPlayerSongStats()
                .catch((error: any) => this._eleService.send<TSendError>('ERROR', error))
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

            this._initIsInstalledSong()
                .catch(error => this._eleService.send<TSendError>('ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.installedSongsService.installedSongsReloaded.pipe(
                            mergeMap(async () => {
                                try {
                                    await this._initIsInstalledSong();
                                } catch (error: any) {
                                    this._eleService.send<TSendError>('ERROR', error);
                                }
                            })
                        )
                    );
                });
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
                this.dlService.add(this.tMapDetail, this.latestVersion, this.isInstalledSong);
            }
        }
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
                    this.isInstalledSong
                );
                await this.dlService.installSingle(dlInfo);
            }
        } catch (error: any) {
            this._notify.error(error);
        }
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
                tLevelStatsInfo.result.levelStats = tLevelStatsInfo.result.levelStats.sort(
                    (a: LevelStatsData, b: LevelStatsData) =>
                        a.difficulty < b.difficulty ? 1 : a.difficulty > b.difficulty ? -1 : 0
                );
                this.tLevelStatsInfo = tLevelStatsInfo.result;
            } else {
                this.tLevelStatsInfo = undefined;
            }
        }
    }

    private async _initIsInstalledSong(): Promise<void> {
        if (this.tMapDetail) {
            const result = await this.installedSongsService
                .songIsInstalled(this.tMapDetail?.id)
                .catch(error => {
                    this._eleService.send<TSendError>('ERROR', error);
                });
            this.isInstalledSong = { status: result && result.result ? 'INSTALLED' : false };
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
