import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../difficulty-card/difficulty-card.module';
import { DifficultyTagModule } from '../difficulty-tag/difficulty-tag.module';
import { PlayerStatsModule } from '../player-stats/player-stats.module';
import { SongStatsModule } from '../song-stats/song-stats.module';
import { SongCardComponent } from './song-card.component';

@NgModule({
    declarations: [SongCardComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        SongStatsModule,
        DifficultyTagModule,
        PlayerStatsModule,
        DifficultyCardModule
    ],
    exports: [SongCardComponent],
    providers: []
})
export class SongCardModule {}
