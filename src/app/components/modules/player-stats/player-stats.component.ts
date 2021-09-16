import { Component, Input } from '@angular/core';
import { EDifficulty } from '../../../../models/api/api.models';
import { ApiHelpers } from '../../../../models/maps/maps.helpers';
import { LevelStatsData } from '../../../../models/player/player-data.model';

@Component({
    selector: 'app-player-stats',
    templateUrl: './player-stats.component.html',
    styleUrls: ['./player-stats.component.scss']
})
export class PlayerStatsComponent {
    @Input() stats?: LevelStatsData;

    private _iconUrl: string;
    get iconUrl(): string {
        if (!this._iconUrl)
            this._iconUrl =
                ApiHelpers.getCharacteristicIcon(this.stats?.beatmapCharacteristicName) || '';
        return this._iconUrl;
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

    private _difficulty?: EDifficulty;
    get difficulty(): EDifficulty | undefined {
        if (!this._difficulty)
            this._difficulty = ApiHelpers.getDifficulyFromIndex(this.stats?.difficulty);
        return this._difficulty;
    }

    constructor() {
        this._iconUrl = '';
    }
}
