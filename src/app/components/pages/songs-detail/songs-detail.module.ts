import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardModule } from '../../modules/difficulty-card/difficulty-card.module';
import { LeaderboardModule } from '../../modules/leaderboard/leaderboard.module';
import { SongsDetailComponent } from './songs-detail.component';

@NgModule({
    declarations: [SongsDetailComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        DifficultyCardModule,
        LeaderboardModule,
        ScrollPanelModule,
        ConfirmPopupModule,
        RouterModule
    ],
    exports: [SongsDetailComponent],
    providers: []
})
export class SongsDetailModule {}
