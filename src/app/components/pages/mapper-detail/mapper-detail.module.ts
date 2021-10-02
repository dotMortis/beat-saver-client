import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongCardModule } from '../../modules/song-card/song-card.module';
import { MapperDetailComponent } from './mapper-detail.component';
@NgModule({
    declarations: [MapperDetailComponent],
    imports: [
        CommonModule,
        SongCardModule,
        SharedAppModule,
        ButtonModule,
        PaginatorModule,
        RouterModule,
        InputTextModule
    ],
    exports: [MapperDetailComponent],
    providers: []
})
export class MapperDetailModule {}
