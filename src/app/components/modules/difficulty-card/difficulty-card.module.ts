import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyCardComponent } from './difficulty-card.component';

@NgModule({
    declarations: [DifficultyCardComponent],
    imports: [CommonModule, SharedAppModule, FormsModule, DropdownModule],
    exports: [DifficultyCardComponent],
    providers: []
})
export class DifficultyCardModule {}
