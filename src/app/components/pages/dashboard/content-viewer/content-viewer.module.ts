import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ContentViewerService } from '../../../../services/null.provided/content-viewer.service';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { LocalMapsModule } from '../../local-maps/local-maps.module';
import { SongsDetailModule } from '../../songs-detail/songs-detail.module';
import { SongsModule } from '../../songs/songs.module';
import { ChangelogComponent } from './changelog/changelog.component';
import { CoffeeComponent } from './coffee/coffee.component';
import { ContentViewerComponent } from './content-viewer.component';
import { DetailBtnPanelComponent } from './detail-btn-panel/detail-btn-panel.component';
import { ViewContentComponent } from './view-content/view-content.component';
import { ViewTemplateModule } from './view-template/view-template.directive';

@NgModule({
    declarations: [
        ContentViewerComponent,
        ViewContentComponent,
        CoffeeComponent,
        ChangelogComponent,
        DetailBtnPanelComponent
    ],
    imports: [
        CommonModule,
        SharedAppModule,
        ScrollPanelModule,
        ScrollTopModule,
        ViewTemplateModule,
        SongsModule,
        LocalMapsModule,
        JoyrideModule.forChild(),
        MarkdownModule.forChild(),
        ButtonModule,
        BadgeModule,
        DynamicDialogModule,
        TieredMenuModule,
        SongsDetailModule
    ],
    entryComponents: [],
    exports: [ContentViewerComponent],
    providers: [ContentViewerService]
})
export class ContentViewerModule {}
