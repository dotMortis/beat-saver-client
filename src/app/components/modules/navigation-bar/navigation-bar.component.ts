import { Component } from '@angular/core';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendError } from '../../../../models/electron/send.channels';
import { DlService } from '../../../services/dl.service';
import { ElectronService } from '../../../services/electron.service';
import { InstalledSongsService } from '../../../services/installed-songs.service';
import { PlayerStatsService } from '../../../services/player-stats.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
    constructor(
        public electronService: ElectronService,
        public optService: SettingsService,
        public dlService: DlService,
        public installedSongsService: InstalledSongsService,
        public playerStatsService: PlayerStatsService
    ) {}

    async onReload(): Promise<void> {
        await Promise.all([
            this.playerStatsService
                .loadPlayersStats()
                .catch(e => ipcRendererSend<TSendError>(this.electronService, 'ERROR', e)),
            this.installedSongsService
                .loadInstalledSongs()
                .catch(e => ipcRendererSend<TSendError>(this.electronService, 'ERROR', e))
        ]);
    }
}
