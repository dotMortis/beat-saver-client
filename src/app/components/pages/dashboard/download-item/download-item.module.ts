import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { DownloadItemComponent } from './download-item.component';

@NgModule({
    declarations: [DownloadItemComponent],
    imports: [CommonModule, SharedAppModule],
    exports: [DownloadItemComponent],
    providers: []
})
export class DownloadItemModule {}
