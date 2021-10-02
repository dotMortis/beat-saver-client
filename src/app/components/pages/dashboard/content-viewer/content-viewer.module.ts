import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ContentViewerService } from '../../../../services/null.provided/content-viewer.service';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { LocalMapsModule } from '../../local-maps/local-maps.module';
import { MapperDetailModule } from '../../mapper-detail/mapper-detail.module';
import { MappersModule } from '../../mappers/mappers.module';
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
        JoyrideModule.forChild(),
        MarkdownModule.forChild(),
        ScrollPanelModule,
        ScrollTopModule,
        ViewTemplateModule,
        SongsModule,
        LocalMapsModule,
        MappersModule,
        BadgeModule,
        ButtonModule,
        DynamicDialogModule,
        TieredMenuModule,
        SongsDetailModule,
        MapperDetailModule,
        OverlayPanelModule,
        InputTextModule,
        FormsModule
    ],
    exports: [ContentViewerComponent],
    providers: [ContentViewerService]
})
export class ContentViewerModule {}
