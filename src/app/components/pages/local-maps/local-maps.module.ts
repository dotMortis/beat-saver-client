import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { LocalMapsComponent } from './local-maps.component';
import { LocalMapsRounting } from './local-maps.routing';

@NgModule({
    declarations: [LocalMapsComponent],
    imports: [LocalMapsRounting, CommonModule, SharedAppModule, ButtonModule, SongCardModule],
    exports: [LocalMapsComponent],
    providers: []
})
export class LocalMapsModule {}
