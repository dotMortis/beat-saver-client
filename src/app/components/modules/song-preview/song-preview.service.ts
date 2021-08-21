import { EventEmitter, Injectable, Input, Output } from '@angular/core';

@Injectable({
    providedIn: null
})
export class SongPreviewService {
    private _showPreview?: string;
    @Input() set showPreview(value: string | undefined) {
        this._showPreview = value;
        this.showPreviewChange.emit(this._showPreview);
    }
    get showPreview(): string | undefined {
        return this._showPreview;
    }
    @Output() showPreviewChange = new EventEmitter<string | undefined>();
}
