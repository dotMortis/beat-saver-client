import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShortNumberPipe } from '../../../pipes/short-number.pipe';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongStatsComponent } from './song-stats.component';

@NgModule({
    declarations: [SongStatsComponent, ShortNumberPipe],
    imports: [CommonModule, SharedAppModule],
    exports: [SongStatsComponent],
    providers: []
})
export class SongStatsModule {}
