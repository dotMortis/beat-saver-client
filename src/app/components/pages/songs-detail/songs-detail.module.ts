import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../../modules/difficulty-card/difficulty-card.module';
import { PlayerStatsModule } from '../../modules/player-stats/player-stats.module';
import { SongCardService } from '../../modules/song-card/song-card.service';
import { SongStatsModule } from '../../modules/song-stats/song-stats.module';
import { SongsDetailComponent } from './songs-detail.component';
import { SongsDetailRounting } from './songs-detail.routing';

@NgModule({
    declarations: [SongsDetailComponent],
    imports: [
        SongsDetailRounting,
        CommonModule,
        SharedAppModule,
        PlayerStatsModule,
        SongStatsModule,
        DifficultyCardModule
    ],
    exports: [SongsDetailComponent],
    providers: [SongCardService]
})
export class SongsDetailModule {}