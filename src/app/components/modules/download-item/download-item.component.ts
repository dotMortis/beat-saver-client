import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ipcRendererOn } from '../../../../models/electron/electron.register';
import { TDownloadItemInfo, TSendBrowserDownload } from '../../../../models/electron/send.channels';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { ElectronService } from '../../../services/root.provided/electron.service';

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

    constructor(private _eleService: ElectronService, private _detectionRef: ChangeDetectorRef) {
        super();
        this._downloads = new Map<string, TDownloadItemInfo>();
    }

    ngOnInit(): void {
        //this.addSub(this._dlService.sub().pipe(tap(() => {})));

        ipcRendererOn<TSendBrowserDownload>(
            this._eleService,
            'DOWNLOAD',
            (e, args: TDownloadItemInfo) => {
                const { id } = args;
                if (this._downloads.has(id)) {
                    const dl = <TDownloadItemInfo>this._downloads.get(id);
                    dl.event = args.event;
                    dl.isPaused = args.isPaused;
                    dl.progress = args.progress;
                    dl.state = args.state;
                    if (args.event === 'done') {
                        setTimeout(() => {
                            this._downloads.delete(id);
                            this._downloadsArr = Array.from(this._downloads.values());
                            this._detectionRef.detectChanges();
                        }, 3000);
                    }
                    this._downloadsArr = Array.from(this._downloads.values());
                    this._detectionRef.detectChanges();
                } else if (args.event !== 'done') {
                    this._downloads.set(id, args);
                    this._downloadsArr = Array.from(this._downloads.values());
                    this._detectionRef.detectChanges();
                }
            }
        );
    }
}
