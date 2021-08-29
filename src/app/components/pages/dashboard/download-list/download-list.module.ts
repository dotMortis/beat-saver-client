import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { DlSongCardModule } from './dl-song-card/dl-song-card.module';
import { DownloadListComponent } from './download-list.component';

@NgModule({
    declarations: [DownloadListComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        DlSongCardModule,
        SidebarModule,
        ScrollPanelModule,
        ButtonModule,
        SplitButtonModule,
        InputTextModule,
        FormsModule
    ],
    exports: [DownloadListComponent]
})
export class DownloadListModule {}
