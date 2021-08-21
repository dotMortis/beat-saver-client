import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { PlayerStatsComponent } from './player-stats.component';

@NgModule({
    declarations: [PlayerStatsComponent],
    imports: [CommonModule, SharedAppModule, OverlayPanelModule],
    exports: [PlayerStatsComponent],
    providers: []
})
export class PlayerStatsModule {}
