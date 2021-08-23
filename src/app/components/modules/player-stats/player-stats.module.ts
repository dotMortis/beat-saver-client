import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { PlayerStatsComponent } from './player-stats.component';

@NgModule({
    declarations: [PlayerStatsComponent],
    imports: [CommonModule, SharedAppModule],
    exports: [PlayerStatsComponent],
    providers: []
})
export class PlayerStatsModule {}
