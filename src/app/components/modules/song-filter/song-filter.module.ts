import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SongFilterComponent } from './song-filter.component';

@NgModule({
    declarations: [SongFilterComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        FormsModule,
        SliderModule,
        CalendarModule,
        DropdownModule,
        MultiSelectModule,
        TagModule,
        ButtonModule,
        InputTextModule
    ],
    exports: [SongFilterComponent]
})
export class SongFilterModule {}
