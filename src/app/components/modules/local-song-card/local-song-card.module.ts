import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../difficulty-card/difficulty-card.module';
import { DifficultyTagModule } from '../difficulty-tag/difficulty-tag.module';
import { PlayerStatsModule } from '../player-stats/player-stats.module';
import { SongStatsModule } from '../song-stats/song-stats.module';
import { LocalSongCardComponent } from './local-song-card.component';

@NgModule({
    declarations: [LocalSongCardComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        RouterModule,
        SongStatsModule,
        DifficultyTagModule,
        PlayerStatsModule,
        DifficultyCardModule
    ],
    exports: [LocalSongCardComponent],
    providers: []
})
export class LocalSongCardModule {}
