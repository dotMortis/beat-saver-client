import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { LeaderboardComponent } from './leaderboard.component';

@NgModule({
    declarations: [LeaderboardComponent],
    imports: [CommonModule, SharedAppModule, TableModule, SkeletonModule],
    exports: [LeaderboardComponent],
    providers: []
})
export class LeaderboardModule {}
