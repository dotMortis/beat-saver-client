import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { LocalSongFilterComponent } from './local-song-filter.component';

@NgModule({
    declarations: [LocalSongFilterComponent],
    imports: [CommonModule, SharedAppModule, FormsModule, ButtonModule, InputTextModule],
    exports: [LocalSongFilterComponent]
})
export class LocalSongFilterModule {}
