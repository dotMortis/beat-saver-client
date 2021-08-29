import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TSendReady } from '../../../../models/electron/send.channels';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { TourService } from '../../../services/root.provided/tour.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends UnsubscribeComponent implements AfterViewInit, OnInit {
    @ViewChild('nav') navBar?: NavigationBarComponent;

    private _isElectron?: boolean;
    get isElectron(): boolean {
        return this._isElectron || false;
    }

    constructor(private _eleService: ElectronService, private _tourService: TourService) {
        super();
    }

    ngOnInit(): void {
        this._isElectron = this._eleService.isElectron;
    }

    ngAfterViewInit(): void {
        const version = window.localStorage.getItem('version');
        if (version !== environment.version) {
            window.localStorage.setItem('version', environment.version);
            this._tourService.shown(false);
            this.navBar?.showChangelog();
        }
        this._eleService.send<TSendReady>('READY', undefined);
    }
}
