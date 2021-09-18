import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { SongFilterModule } from '../../modules/song-filter/song-filter.module';
import { SongsComponent } from './songs.component';
import { SongsRounting } from './songs.routing';

@NgModule({
    declarations: [SongsComponent],
    imports: [
        SongsRounting,
        CommonModule,
        SongCardModule,
        SharedAppModule,
        SongFilterModule,
        ButtonModule
    ],
    exports: [SongsComponent],
    providers: []
})
export class SongsModule {}
