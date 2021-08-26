import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ScrollPanel } from 'primeng/scrollpanel';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ipcRendererSend } from '../models/electron/electron.register';
import { TSendError, TSendReady } from '../models/electron/send.channels';
import { UnsubscribeComponent } from '../models/unsubscribe.model';
import { NavigationBarComponent } from './components/modules/navigation-bar/navigation-bar.component';
import { ElectronService } from './services/root.provided/electron.service';
import { ScrollService } from './services/root.provided/scroll.service';
import { SettingsService } from './services/root.provided/settings.service';
import { TourService } from './services/root.provided/tour.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends UnsubscribeComponent implements OnInit, AfterViewInit {
    @ViewChild('mainScroll') scrollPanel?: ScrollPanel;
    @ViewChild('nav') navBar?: NavigationBarComponent;

    constructor(
        private _primengConfig: PrimeNGConfig,
        private _optService: SettingsService,
        private _eleService: ElectronService,
        private _scrollService: ScrollService,
        private _tourService: TourService
    ) {
        super();
    }

    ngAfterViewInit(): void {
        ipcRendererSend<TSendReady>(this._eleService, 'READY', undefined);
        const version = window.localStorage.getItem('version');
        if (version !== environment.version) {
            window.localStorage.setItem('version', environment.version);
            this._tourService.shown(false);
            this.navBar?.showChangelog();
        }
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
            .catch(error => ipcRendererSend<TSendError>(this._eleService, 'ERROR', error));
    }
}
