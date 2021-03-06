import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { SharedAppModule } from '../../../../../shared/shared-app-module';
import { DlSongCardComponent } from './dl-song-card.component';

@NgModule({
    declarations: [DlSongCardComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        RouterModule,
        ButtonModule,
        ProgressBarModule,
        MessageModule
    ],
    exports: [DlSongCardComponent],
    providers: []
})
export class DlSongCardModule {}
