import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { take, tap } from 'rxjs/operators';
import { TSendError } from '../../../../models/electron/send.channels';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
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
export class NavigationBarComponent extends UnsubscribeComponent {
    private _ref?: DynamicDialogRef;

    constructor(
        public electronService: ElectronService,
        public optService: SettingsService,
        public dlService: DlService,
        private _installedSongsService: InstalledSongsService,
        private _playerStatsService: PlayerStatsService,
        private _dialogService: DialogService
    ) {
        super();
    }

    async onReload(): Promise<void> {
        await Promise.all([
            this._playerStatsService
                .loadPlayersStats()
                .catch(e => this.electronService.send<TSendError>('ERROR', e)),
            this._installedSongsService
                .loadInstalledSongs()
                .catch(e => this.electronService.send<TSendError>('ERROR', e))
        ]);
    }

    showCoffee() {
        this._ref = this._dialogService.open(CoffeeComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            header: 'About BeatSaver Client',
            baseZIndex: 10000
        });
        this.addSub(
            this._ref.onClose.pipe(
                take(1),
                tap((msg: 'CHANGELOG' | undefined) => {
                    if (msg === 'CHANGELOG') {
                        this.showChangelog();
                    }
                })
            )
        );
    }

    showChangelog(): void {
        this._ref?.close();
        this._ref = this._dialogService.open(ChangelogComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            baseZIndex: 10000
        });
    }
}
