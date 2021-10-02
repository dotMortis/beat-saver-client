import { Component } from '@angular/core';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';
import { NotifyService } from '../../../services/root.provided/notify.service';

@Component({
    selector: 'app-local-song-filter',
    templateUrl: './local-song-filter.component.html',
    styleUrls: ['./local-song-filter.component.scss']
})
export class LocalSongFilterComponent extends UnsubscribeComponent {
    constructor(public localMapsService: LocalMapsService, private _notify: NotifyService) {
        super(_notify);
    }

    onSearch(): void {
        this.addSub(this.localMapsService.getList(false));
    }
}
