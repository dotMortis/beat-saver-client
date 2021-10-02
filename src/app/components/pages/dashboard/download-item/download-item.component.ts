import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../../models/angular/unsubscribe.model';
import {
    TDownloadItemInfo,
    TSendBrowserDownload
} from '../../../../../models/electron/send.channels';
import { ElectronService } from '../../../../services/root.provided/electron.service';
import { NotifyService } from '../../../../services/root.provided/notify.service';

@Component({
    selector: 'app-download-item',
    templateUrl: './download-item.component.html',
    styleUrls: ['./download-item.component.scss']
})
export class DownloadItemComponent extends UnsubscribeComponent implements OnInit {
    private _downloads: Map<string, TDownloadItemInfo>;

    private _downloadsArr?: Array<TDownloadItemInfo>;
    public get downloadsArr(): Array<TDownloadItemInfo> | undefined {
        return this._downloadsArr;
    }

    constructor(private _eleService: ElectronService, private _notify: NotifyService) {
        super(_notify);
        this._downloads = new Map<string, TDownloadItemInfo>();
    }

    ngOnInit(): void {
        this.addSub(
            this._eleService.on<TSendBrowserDownload>('DOWNLOAD').pipe(
                tap((data: TDownloadItemInfo) => {
                    const { id } = data;
                    if (this._downloads.has(id)) {
                        const dl = <TDownloadItemInfo>this._downloads.get(id);
                        dl.event = data.event;
                        dl.isPaused = data.isPaused;
                        dl.progress = data.progress;
                        dl.state = data.state;
                        if (data.event === 'done') {
                            setTimeout(() => {
                                this._downloads.delete(id);
                                this._downloadsArr = Array.from(this._downloads.values());
                            }, 3000);
                        }
                        this._downloadsArr = Array.from(this._downloads.values());
                    } else if (data.event !== 'done') {
                        this._downloads.set(id, data);
                        this._downloadsArr = Array.from(this._downloads.values());
                    }
                })
            )
        );
    }
}
