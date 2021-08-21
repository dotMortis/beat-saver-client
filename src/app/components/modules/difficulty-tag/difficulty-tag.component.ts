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
    get iconUrl(): string {
        return ApiHelpers.getCharacteristicIcon(this.tMapDifficulty?.characteristic) || '';
    }
    get label(): string {
        return ApiHelpers.getDifficultyLabel(this.tMapDifficulty?.difficulty);
    }

    constructor() {}
}
