import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { delay, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { SongPreviewService } from './song-preview.service';

@Component({
    selector: 'app-song-preview',
    templateUrl: './song-preview.component.html',
    styleUrls: ['./song-preview.component.scss']
})
export class SongPreviewComponent extends UnsubscribeComponent implements OnInit {
    private _url?: string;
    get url(): string {
        return this._url != null
            ? 'https://skystudioapps.com/bs-viewer/?noProxy=true&url=' + this._url
            : '';
    }
    private _showIframe: boolean;
    @Input() set showIframe(value: boolean) {
        if (this._showIframe !== value) this._showIframe = value;
    }
    get showIframe(): boolean {
        return this._showIframe;
    }
    @Output() showIframeChange: EventEmitter<boolean>;

    constructor(public songPreviewService: SongPreviewService) {
        super();
        this._showIframe = false;
        this.showIframeChange = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
        this.addSub(
            this.songPreviewService.showPreviewChange.pipe(
                tap((url: string | undefined) => {
                    this._url = url;
                    this.showIframe = false;
                }),
                delay(500),
                tap(_ => (this.showIframe = true))
            )
        );
    }
}
