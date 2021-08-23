import { Component, Input, OnInit } from '@angular/core';
import { TMapDetail, TMapVersion } from '../../../../../models/api.models';
import { UnsubscribeComponent } from '../../../../../models/unsubscribe.model';
import { DlService } from '../../../../services/dl.service';
import { SongPreviewService } from '../../song-preview/song-preview.service';

@Component({
    selector: 'app-dl-song-card',
    templateUrl: './dl-song-card.component.html',
    styleUrls: ['./dl-song-card.component.scss']
})
export class DlSongCardComponent extends UnsubscribeComponent implements OnInit {
    @Input() tMapDetail?: TMapDetail;
    @Input() lastVersion?: TMapVersion;
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

    constructor(public songPreviewService: SongPreviewService, public dlService: DlService) {
        super();
        this.installed = false;
        this.download = 0;
        this._songNameShort = 'N/A';
    }

    ngOnInit(): void {
        if (this.lastVersion != null) {
            this._setUploadTimeInfo(this.lastVersion.createdAt);
        }
    }

    onPlayPreview(): void {
        this.songPreviewService.showPreview = this.lastVersion?.downloadURL;
    }

    onTitleClick(event: MouseEvent): void {}

    onRemove(): void {
        if (this.lastVersion) {
            this.dlService.remove(this.lastVersion);
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
