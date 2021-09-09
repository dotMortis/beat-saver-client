import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { LeaderboardComponent } from './leaderboard.component';

@NgModule({
    declarations: [LeaderboardComponent],
    imports: [
        CommonModule,
        RouterModule,
        SharedAppModule,
        TableModule,
        SkeletonModule,
        ButtonModule
    ],
    exports: [LeaderboardComponent],
    providers: []
})
export class LeaderboardModule {}
