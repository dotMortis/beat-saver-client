import { Component, Input } from '@angular/core';
import { ApiHelpers } from '../../../../models/api.helpers';
import { TMapDifficulty } from '../../../../models/api.models';

@Component({
    selector: 'app-difficulty-tag',
    templateUrl: './difficulty-tag.component.html',
    styleUrls: ['./difficulty-tag.component.scss']
})
export class DifficultyTagComponent {
    @Input() tMapDifficulty?: TMapDifficulty;
    private _iconUrl: string;
    get iconUrl(): string {
        if (!this._iconUrl) {
            this._iconUrl =
                ApiHelpers.getCharacteristicIcon(this.tMapDifficulty?.characteristic) || '';
        }
        return this._iconUrl;
    }
    private _label: string;
    get label(): string {
        if (!this._label)
            this._label = ApiHelpers.getDifficultyLabel(this.tMapDifficulty?.difficulty);
        return this._label;
    }

    constructor() {
        this._iconUrl = '';
        this._label = '';
    }
}
