import { Component, Input } from '@angular/core';
import { ApiHelpers } from '../../../../models/api.helpers';
import { EDifficulty } from '../../../../models/api.models';
import { LevelStatsData } from '../../../../models/player-data.model';

@Component({
    selector: 'app-player-stats',
    templateUrl: './player-stats.component.html',
    styleUrls: ['./player-stats.component.scss']
})
export class PlayerStatsComponent {
    @Input() stats?: LevelStatsData;

    get iconUrl(): string {
        return ApiHelpers.getCharacteristicIcon(this.stats?.beatmapCharacteristicName) || '';
    }

    get playCount(): number | undefined {
        return this.stats?.playCount;
    }

    get highScore(): number | undefined {
        return this.stats?.highScore;
    }

    get maxCombo(): number | undefined {
        return this.stats?.maxCombo;
    }

    get fullCombo(): boolean | undefined {
        return this.stats?.fullCombo;
    }

    get difficulty(): EDifficulty | undefined {
        return ApiHelpers.getDifficulyFromIndex(this.stats?.difficulty);
    }

    constructor() {}
}
