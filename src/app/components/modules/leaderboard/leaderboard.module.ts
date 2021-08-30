import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { LeaderboardComponent } from './leaderboard.component';

@NgModule({
    declarations: [LeaderboardComponent],
    imports: [CommonModule, SharedAppModule],
    exports: [LeaderboardComponent],
    providers: []
})
export class LeaderboardModule {}
