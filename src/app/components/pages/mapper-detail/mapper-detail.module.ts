import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { MapperDetailComponent } from './mapper-detail.component';

@NgModule({
    declarations: [MapperDetailComponent],
    imports: [CommonModule, SongCardModule, SharedAppModule, ButtonModule],
    exports: [MapperDetailComponent],
    providers: []
})
export class MapperDetailModule {}
