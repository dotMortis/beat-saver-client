import { Component, Input, OnInit } from '@angular/core';
import { UnsubscribeComponent } from '../../../../../../models/angular/unsubscribe.model';
import { TMapDetail, TMapVersion } from '../../../../../../models/api/api.models';
import { ContentViewerService } from '../../../../../services/null.provided/content-viewer.service';
import { DlService } from '../../../../../services/null.provided/dl.service';
import { NotifyService } from '../../../../../services/root.provided/notify.service';
import { SongPreviewService } from '../../song-preview/song-preview.service';

@Component({
    selector: 'app-dl-song-card',
    templateUrl: './dl-song-card.component.html',
    styleUrls: ['./dl-song-card.component.scss']
})
export class DlSongCardComponent extends UnsubscribeComponent implements OnInit {
    @Input() tMapDetail?: TMapDetail;
    @Input() latestVersion?: TMapVersion;
    @Input() installed: false | 'INSTALLED' | 'INSTALLING';
    @Input() download: number;
    @Input() installError?: Error;

    private _songNameShort: string;
    get songNameShort(): string {
        if (this._songNameShort === 'N/A' && this.tMapDetail?.name) {
            this._songNameShort =
                this.tMapDetail.name.length > 15
                    ? `${this.tMapDetail?.name.slice(0, 15)}...`
                    : this.tMapDetail?.name || 'N/A';
        }
        return this._songNameShort;
    }
    get songName(): string {
        return this.tMapDetail?.name || 'N/A';
    }

    public uploadTimeInfo?: string | Date;

    constructor(
        public songPreviewService: SongPreviewService,
        public dlService: DlService,
        private _cvService: ContentViewerService,
        private _notify: NotifyService
    ) {
        super(_notify);
        this.installed = false;
        this.download = 0;
        this._songNameShort = 'N/A';
    }

    ngOnInit(): void {
        if (this.latestVersion != null) {
            this._setUploadTimeInfo(this.latestVersion.createdAt);
        }
    }

    onPlayPreview(): void {
        this.songPreviewService.showPreview = this.latestVersion?.downloadURL;
    }

    onRemove(): void {
        if (this.latestVersion) {
            this.dlService.remove(this.latestVersion);
        }
    }

    onOpenDetail() {
        if (this.tMapDetail && this.latestVersion)
            this._cvService.addSongDetailView(this.tMapDetail, this.latestVersion);
    }

    onOpenMapper() {
        if (this.tMapDetail)
            this._cvService.addMapperDetailView({ id: this.tMapDetail.uploader.id });
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
