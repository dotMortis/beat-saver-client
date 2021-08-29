import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ScrollPanel } from 'primeng/scrollpanel';
import { tap } from 'rxjs/operators';
import { TSendError } from '../models/electron/send.channels';
import { UnsubscribeComponent } from '../models/unsubscribe.model';
import { ElectronService } from './services/root.provided/electron.service';
import { ScrollService } from './services/root.provided/scroll.service';
import { SettingsService } from './services/root.provided/settings.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends UnsubscribeComponent implements OnInit {
    @ViewChild('mainScroll') scrollPanel?: ScrollPanel;

    constructor(
        private _primengConfig: PrimeNGConfig,
        private _optService: SettingsService,
        private _eleService: ElectronService,
        private _scrollService: ScrollService
    ) {
        super();
    }

    ngOnInit() {
        this._primengConfig.ripple = true;
        this.addSub(
            this._scrollService.onScrollTop.pipe(tap(() => this.scrollPanel?.scrollTop(0)))
        );
        this._optService
            .loadSettings()
            .then(() => {
                if (!this._optService.settingsComplete) {
                    this._optService.visible = true;
                }
            })
            .catch(error => this._eleService.send<TSendError>('ERROR', error));
    }
}
