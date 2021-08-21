import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { DifficultyTagComponent } from './difficulty-tag.component';

@NgModule({
    declarations: [DifficultyTagComponent],
    imports: [CommonModule, SharedAppModule],
    exports: [DifficultyTagComponent],
    providers: []
})
export class DifficultyTagModule {}
