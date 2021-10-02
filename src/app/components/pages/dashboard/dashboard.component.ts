import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TSendReady } from '../../../../models/electron/send.channels';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { NotifyService } from '../../../services/root.provided/notify.service';
import { TourService } from '../../../services/root.provided/tour.service';
import { ContentViewerComponent } from './content-viewer/content-viewer.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends UnsubscribeComponent implements AfterViewInit, OnInit {
    @ViewChild('cv') contentViewer?: ContentViewerComponent;

    private _isElectron?: boolean;
    get isElectron(): boolean {
        return this._isElectron || false;
    }

    constructor(
        private _eleService: ElectronService,
        private _tourService: TourService,
        private _notify: NotifyService
    ) {
        super(_notify);
    }

    ngOnInit(): void {
        this._isElectron = this._eleService.isElectron;
    }

    ngAfterViewInit(): void {
        const version = window.localStorage.getItem('version');
        if (version !== environment.version) {
            window.localStorage.setItem('version', environment.version);
            this._tourService.shown(false);
            this.contentViewer?.showChangelog();
        }
        this._eleService.send<TSendReady>('READY', undefined);
    }
}
