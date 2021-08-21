import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { TMapDetail, TMapVersion } from '../../../../models/api.models';
import { TInstalled } from '../../../../models/download.model';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendDebug, TSendError } from '../../../../models/electron/send.channels';
import { LevelStatsData, TLevelStatsInfo } from '../../../../models/player-data.model';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { DlService } from '../../../services/dl.service';
import { ElectronService } from '../../../services/electron.service';
import { InstalledSongsService } from '../../../services/installed-songs.service';
import { NotifyService } from '../../../services/notify.service';
import { PlayerStatsService } from '../../../services/player-stats.service';
import { SongPreviewService } from '../song-preview/song-preview.service';

@Component({
    selector: 'app-song-card',
    templateUrl: './song-card.component.html',
    styleUrls: ['./song-card.component.scss']
})
export class SongCardComponent extends UnsubscribeComponent implements OnInit {
    @Input() tMapDetail?: TMapDetail;
    public tLevelStatsInfo?: TLevelStatsInfo;
    public isInstalledSong: { status: TInstalled };

    get songNameShort(): string {
        return this.tMapDetail?.name?.length && this.tMapDetail?.name?.length > 70
            ? `${this.tMapDetail?.name.slice(0, 70)}...`
            : this.tMapDetail?.name || 'N/A';
    }
    get songName(): string {
        return this.tMapDetail?.name || 'N/A';
    }

    get inQueue(): boolean {
        if (this.latestVersion) return this.dlService.has(this.latestVersion);
        else return false;
    }

    public latestVersion?: TMapVersion;
    public uploadTimeInfo?: string | Date;

    constructor(
        public songPreviewService: SongPreviewService,
        public playerStatsService: PlayerStatsService,
        public installedSongsService: InstalledSongsService,
        public dlService: DlService,
        private _eleService: ElectronService,
        private _notify: NotifyService,
        private _clipboard: Clipboard
    ) {
        super();
        this.isInstalledSong = { status: false };
    }

    ngOnInit(): void {
        this.latestVersion = this.tMapDetail?.versions
            .sort((a: TMapVersion, b: TMapVersion) =>
                a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1
            )
            .pop();
        if (this.latestVersion != null) {
            this._setUploadTimeInfo(this.latestVersion.createdAt);
            this._loadPlayerSongStats()
                .catch(error => ipcRendererSend<TSendError>(this._eleService, 'ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.playerStatsService.selectedPlayerChange.pipe(
                            mergeMap(async (result: { name: string } | undefined) => {
                                try {
                                    if (result) {
                                        await this._loadPlayerSongStats();
                                    }
                                } catch (error) {
                                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                                }
                            })
                        )
                    );
                    this.addSub(
                        this.playerStatsService.playerStatsReloaded.pipe(
                            mergeMap(async () => {
                                try {
                                    await this._loadPlayerSongStats();
                                } catch (error) {
                                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                                }
                            })
                        )
                    );
                });

            this._initIsInstalledSong()
                .catch(error => ipcRendererSend<TSendError>(this._eleService, 'ERROR', error))
                .finally(() => {
                    this.addSub(
                        this.installedSongsService.installedSongsReloaded.pipe(
                            mergeMap(async () => {
                                try {
                                    await this._initIsInstalledSong();
                                } catch (error) {
                                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
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

    onTitleClick(event: MouseEvent): void {}

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
        } catch (error) {
            this._notify.error(error);
        }
    }

    private async _loadPlayerSongStats(): Promise<void> {
        if (this.latestVersion?.hash) {
            const tLevelStatsInfo = await this.playerStatsService
                .loadPlayerSongStats(this.latestVersion.hash)
                .toPromise()
                .catch(error => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                });
            ipcRendererSend<TSendDebug>(this._eleService, 'DEBUG', {
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
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
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
