import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { InstallPanelComponent } from './install-panel/install-panel.component';
import { UpdateAppComponent } from './update-app.component';

@NgModule({
    declarations: [UpdateAppComponent, InstallPanelComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        DynamicDialogModule,
        ButtonModule,
        ProgressBarModule,
        MarkdownModule.forChild()
    ],
    exports: [UpdateAppComponent],
    entryComponents: [InstallPanelComponent],
    providers: []
})
export class UpdateAppModule {}
