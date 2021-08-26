import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import {
    faCheckCircle,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faCloudDownloadAlt,
    faDownload,
    faFileArchive,
    faGraduationCap,
    faLink,
    faPlayCircle,
    faStar,
    faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { MessageService } from 'primeng/api';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ToastModule } from 'primeng/toast';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { DownloadItemModule } from './components/modules/download-item/download-item.module';
import { DownloadListModule } from './components/modules/download-list/download-list.module';
import { NavigationBarModule } from './components/modules/navigation-bar/navigation-bar.module';
import { SettingsModule } from './components/modules/settings/settings.module';
import { SongPreviewModule } from './components/modules/song-preview/song-preview.module';
import { SongPreviewService } from './components/modules/song-preview/song-preview.service';
import { ApiService } from './services/null.provided/api.service';
import { DlService } from './services/null.provided/dl.service';
import { InstalledSongsService } from './services/null.provided/installed-songs.service';
import { PlayerStatsService } from './services/null.provided/player-stats.service';
import { SharedAppModule } from './shared/shared-app-module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgbModule,
        SharedAppModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        JoyrideModule.forRoot(),
        SongPreviewModule,
        DownloadItemModule,
        NavigationBarModule,
        SettingsModule,
        ScrollPanelModule,
        ScrollTopModule,
        ToastModule,
        DownloadListModule
    ],
    providers: [
        MessageService,
        ApiService,
        SongPreviewService,
        PlayerStatsService,
        InstalledSongsService,
        DlService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private library: FaIconLibrary) {
        library.addIcons(
            faTwitch,
            faDownload,
            faCloudDownloadAlt,
            faPlayCircle,
            faFileArchive,
            faStar,
            faLink,
            faCheckCircle,
            faTrophy,
            faGraduationCap,
            faChevronUp,
            faChevronDown,
            faChevronLeft,
            faChevronRight
        );
    }
}
