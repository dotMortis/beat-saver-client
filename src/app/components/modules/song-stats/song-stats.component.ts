import { Component, Input } from '@angular/core';
import { TMapStats } from '../../../../models/api/api.models';

@Component({
    selector: 'app-song-stats',
    templateUrl: './song-stats.component.html',
    styleUrls: ['./song-stats.component.scss']
})
export class SongStatsComponent {
    @Input() tMapStats?: TMapStats;
    get upvotes(): number {
        return this.tMapStats?.upvotes || 0;
    }
    get downvotes(): number {
        return this.tMapStats?.downvotes || 0;
    }

    constructor() {}
}
