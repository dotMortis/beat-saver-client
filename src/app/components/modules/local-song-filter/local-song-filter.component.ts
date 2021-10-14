import { Component, EventEmitter, Output } from '@angular/core';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';

@Component({
    selector: 'app-local-song-filter',
    templateUrl: './local-song-filter.component.html',
    styleUrls: ['./local-song-filter.component.scss']
})
export class LocalSongFilterComponent {
    @Output()
    search: EventEmitter<void>;

    constructor(public localMapsService: LocalMapsService) {
        this.search = new EventEmitter<void>();
    }

    onSearch(): void {
        this.search.next();
    }
}
