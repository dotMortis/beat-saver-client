import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../../modules/difficulty-card/difficulty-card.module';
import { LeaderboardModule } from '../../modules/leaderboard/leaderboard.module';
import { SongsDetailComponent } from './songs-detail.component';
import { SongsDetailRounting } from './songs-detail.routing';

@NgModule({
    declarations: [SongsDetailComponent],
    imports: [
        SongsDetailRounting,
        CommonModule,
        SharedAppModule,
        DifficultyCardModule,
        LeaderboardModule,
        ScrollPanelModule,
        ConfirmPopupModule
    ],
    exports: [SongsDetailComponent],
    providers: []
})
export class SongsDetailModule {}
