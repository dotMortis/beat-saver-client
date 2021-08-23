import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: null
})
export class SongPreviewService {
    private _showPreview?: string;
    set showPreview(value: string | undefined) {
        this._showPreview = value;
        this.showPreviewChange.emit(this._showPreview);
    }
    get showPreview(): string | undefined {
        return this._showPreview;
    }
    showPreviewChange = new EventEmitter<string | undefined>();
}
