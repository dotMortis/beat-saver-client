import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import {
    faBan,
    faBinoculars,
    faCheckCircle,
    faChevronDown,
    faChevronUp,
    faClock,
    faCloudDownloadAlt,
    faDownload,
    faFileArchive,
    faGraduationCap,
    faHeart,
    faLink,
    faMapMarked,
    faPercent,
    faPlay,
    faPlayCircle,
    faStar,
    faTachometerAlt,
    faThumbsDown,
    faThumbsUp,
    faTrash,
    faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
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
        ToastModule
    ],
    providers: [MessageService],
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
            faHeart,
            faTrash,
            faPlay,
            faBan,
            faBinoculars,
            faTachometerAlt,
            faClock,
            faThumbsUp,
            faThumbsDown,
            faPercent,
            faMapMarked
        );
    }
}
