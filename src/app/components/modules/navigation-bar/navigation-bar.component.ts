import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { tap } from 'rxjs/operators';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendDebug, TSendError } from '../../../../models/electron/send.channels';
import { DlService } from '../../../services/null.provided/dl.service';
import { InstalledSongsService } from '../../../services/null.provided/installed-songs.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { SettingsService } from '../../../services/root.provided/settings.service';
import { ChangelogComponent } from './changelog/changelog.component';
import { CoffeeComponent } from './coffee/coffee.component';

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss'],
    providers: [DialogService]
})
export class NavigationBarComponent {
    ref?: DynamicDialogRef;

    constructor(
        public electronService: ElectronService,
        public optService: SettingsService,
        public dlService: DlService,
        private _installedSongsService: InstalledSongsService,
        private _playerStatsService: PlayerStatsService,
        private _dialogService: DialogService,
        private _eleService: ElectronService
    ) {}

    async onReload(): Promise<void> {
        await Promise.all([
            this._playerStatsService
                .loadPlayersStats()
                .catch(e => ipcRendererSend<TSendError>(this.electronService, 'ERROR', e)),
            this._installedSongsService
                .loadInstalledSongs()
                .catch(e => ipcRendererSend<TSendError>(this.electronService, 'ERROR', e))
        ]);
    }

    showCoffee() {
        this.ref = this._dialogService.open(CoffeeComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            header: 'About BeatSaver Client',
            baseZIndex: 10000
        });
        this.ref.onClose
            .pipe(
                tap((msg: 'CHANGELOG' | undefined) => {
                    if (msg === 'CHANGELOG') {
                        this.showChangelog();
                    }
                })
            )
            .subscribe()
            .add(() => {
                ipcRendererSend<TSendDebug>(this._eleService, 'DEBUG', {
                    msg: 'Unsubscribed coffee onClose'
                });
            });
    }

    showChangelog(): void {
        console.log('showChangelog');

        this.ref?.close();
        this.ref = this._dialogService.open(ChangelogComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            baseZIndex: 10000
        });
    }
}
