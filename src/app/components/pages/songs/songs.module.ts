import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { PaginatorModule } from '../../modules/paginator/paginator.module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { SongFilterModule } from '../../modules/song-filter/song-filter.module';
import { SongsComponent } from './songs.component';

@NgModule({
    declarations: [SongsComponent],
    imports: [
        CommonModule,
        SongCardModule,
        SharedAppModule,
        SongFilterModule,
        ButtonModule,
        PaginatorModule
    ],
    exports: [SongsComponent],
    providers: []
})
export class SongsModule {}
