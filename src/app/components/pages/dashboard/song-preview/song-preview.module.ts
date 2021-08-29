import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SafePipe } from '../../../../pipes/safe.pipe';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { SongPreviewComponent } from './song-preview.component';

@NgModule({
    declarations: [SongPreviewComponent, SafePipe],
    imports: [CommonModule, SharedAppModule, DialogModule],
    exports: [SongPreviewComponent],
    providers: []
})
export class SongPreviewModule {}
