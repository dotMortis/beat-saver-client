import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { PlayerStatsService } from '../../../services/null.provided/player-stats.service';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardService } from '../../modules/song-card/song-card.service';
import { ContentViewerModule } from './better-navigation-bar/content-viewer.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRounting } from './dashboard.routing';
import { DownloadItemModule } from './download-item/download-item.module';
import { DownloadListModule } from './download-list/download-list.module';
import { SettingsModule } from './settings/settings.module';
import { SongPreviewModule } from './song-preview/song-preview.module';
import { SongPreviewService } from './song-preview/song-preview.service';
import { UpdateAppModule } from './update-app/update-app.module';

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        DashboardRounting,
        SharedAppModule,
        SettingsModule,
        DownloadItemModule,
        DownloadListModule,
        SongPreviewModule,
        UpdateAppModule,
        ContentViewerModule
    ],
    exports: [DashboardComponent],
    providers: [
        SongPreviewService,
        ApiService,
        PlayerStatsService,
        LocalMapsService,
        DlService,
        SongCardService
    ]
})
export class DashboardModule {}
