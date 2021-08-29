import { Component } from '@angular/core';
import { UpdateInfo } from 'electron-updater';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TSendUpdate } from '../../../../../../models/electron/send.channels';
import { ElectronService } from '../../../../../services/root.provided/electron.service';

@Component({
    selector: 'app-install-panel',
    templateUrl: './install-panel.component.html',
    styleUrls: ['./install-panel.component.scss']
})
export class InstallPanelComponent {
    private _info: UpdateInfo;
    get info(): UpdateInfo {
        return this._info;
    }

    private _label: string;
    get label(): string {
        return this._label;
    }

    constructor(private _config: DynamicDialogConfig, private _eleService: ElectronService) {
        this._info = _config.data.info;
        this._label = _config.data.label;
    }

    onInstall(): void {
        this._eleService.send<TSendUpdate>('UPDATE', undefined);
    }
}
