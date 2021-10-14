import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { PaginatorModule } from '../../modules/paginator/paginator.module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { MapperDetailComponent } from './mapper-detail.component';
@NgModule({
    declarations: [MapperDetailComponent],
    imports: [CommonModule, SongCardModule, SharedAppModule, PaginatorModule],
    exports: [MapperDetailComponent],
    providers: []
})
export class MapperDetailModule {}
