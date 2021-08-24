import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ipcRendererSend } from '../models/electron/electron.register';
import { TSendError } from '../models/electron/send.channels';
import { ElectronService } from './services/root.provided/electron.service';
import { SettingsService } from './services/root.provided/settings.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(
        private _primengConfig: PrimeNGConfig,
        private _optService: SettingsService,
        private _eleService: ElectronService
    ) {}

    ngOnInit() {
        this._primengConfig.ripple = true;
        this._optService
            .loadSettings()
            .then(() => {
                if (!this._optService.settingsComplete) {
                    this._optService.visible = true;
                }
            })
            .catch(error => ipcRendererSend<TSendError>(this._eleService, 'ERROR', error));
    }
}
