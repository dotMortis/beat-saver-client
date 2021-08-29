import { Component } from '@angular/core';
import { TSongDownloadInfo } from '../../../../../models/download.model';
import { TSendError } from '../../../../../models/electron/send.channels';
import { UnsubscribeComponent } from '../../../../../models/unsubscribe.model';
import { ApiService } from '../../../../services/null.provided/api.service';
import { DlService } from '../../../../services/null.provided/dl.service';
import { ElectronService } from '../../../../services/root.provided/electron.service';
import { NotifyService } from '../../../../services/root.provided/notify.service';

@Component({
    selector: 'app-download-list',
    templateUrl: './download-list.component.html',
    styleUrls: ['./download-list.component.scss']
})
export class DownloadListComponent extends UnsubscribeComponent {
    private _songFilter?: string;
    get songFilter(): string | undefined {
        return this._songFilter;
    }
    set songFilter(value: string | undefined) {
        if (value !== this._songFilter) {
            this._songFilter = value;
            if (this._songFilter?.length) {
                this.filteredItems = this.dlService.filtered(this._songFilter);
            } else {
                this.filteredItems = undefined;
            }
        }
    }
    public filteredItems?: Array<TSongDownloadInfo>;

    constructor(
        public dlService: DlService,
        public apiService: ApiService,
        private _notify: NotifyService,
        private _electronService: ElectronService
    ) {
        super();
    }

    async onDownload() {
        try {
            this._notify.success({
                title: 'Bulkdownload started',
                message: `Queue size: ${this.dlService.dlSize}`
            });
            await this.dlService.installAll();
            this._notify.success({
                title: 'Bulkdownload finished',
                message: `Let's play!`
            });
        } catch (error) {
            this._electronService.send<TSendError>('ERROR', error);
        }
    }

    onClear(type: 'ALL' | 'DOWNLOADED' = 'ALL') {
        if (type === 'ALL') {
            this.dlService.clear();
        } else {
            this.dlService.clearInstalled();
        }
    }
}
