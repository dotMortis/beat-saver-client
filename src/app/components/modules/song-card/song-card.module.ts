import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JoyrideModule } from 'ngx-joyride';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../difficulty-card/difficulty-card.module';
import { DifficultyTagModule } from '../difficulty-tag/difficulty-tag.module';
import { SongStatsModule } from '../song-stats/song-stats.module';
import { SongCardComponent } from './song-card.component';
@NgModule({
    declarations: [SongCardComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        RouterModule,
        JoyrideModule.forChild(),
        SongStatsModule,
        DifficultyTagModule,
        DifficultyCardModule,
        SkeletonModule,
        ConfirmPopupModule
    ],
    exports: [SongCardComponent],
    providers: []
})
export class SongCardModule {}
