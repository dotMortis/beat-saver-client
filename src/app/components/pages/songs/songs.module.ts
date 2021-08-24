import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../services/null.provided/api.service';
import { DlService } from '../../../services/null.provided/dl.service';
import { InstalledSongsService } from '../../../services/null.provided/installed-songs.service';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { SongCardService } from '../../modules/song-card/song-card.service';
import { SongFilterModule } from '../../modules/song-filter/song-filter.module';
import { SongsComponent } from './songs.component';

@NgModule({
    declarations: [SongsComponent],
    imports: [CommonModule, SongCardModule, SharedAppModule, SongFilterModule, ButtonModule],
    exports: [SongsComponent],
    providers: [ApiService, InstalledSongsService, DlService, SongCardService]
})
export class SongsModule {}
