import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { ScrollPanel } from 'primeng/scrollpanel';
import { filter, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../models/angular/unsubscribe.model';
import { TSendError } from '../models/electron/send.channels';
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
        private _scrollService: ScrollService,
        private _router: Router
    ) {
        super();
    }

    ngOnInit() {
        this._primengConfig.ripple = true;
        this.addSub(
            this._scrollService.onScrollTop.pipe(tap(() => this.scrollPanel?.scrollTop(0)))
        );
        this.addSub(
            this._router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                tap(() => this.scrollPanel?.scrollTop(0))
            )
        );
        this._optService
            .loadSettings()
            .then(() => {
                if (!this._optService.settingsComplete) {
                    this._optService.visible = true;
                }
            })
            .catch((error: any) => this._eleService.send<TSendError>('ERROR', error));
    }
}
