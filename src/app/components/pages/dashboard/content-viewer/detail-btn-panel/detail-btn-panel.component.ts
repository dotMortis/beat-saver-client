import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TMapDetail } from '../../../../../../models/api/api.models';
import { TSongId } from '../../../../../../models/maps/map-ids.model';
import { ContentViewerService } from '../../../../../services/null.provided/content-viewer.service';

@Component({
    selector: 'app-detail-btn-panel',
    templateUrl: './detail-btn-panel.component.html',
    styleUrls: ['./detail-btn-panel.component.scss']
})
export class DetailBtnPanelComponent {
    private _activeId?: TSongId;
    @Input()
    get activeId(): TSongId | undefined {
        return this._activeId;
    }
    set activeId(val: TSongId | undefined) {
        if (val !== this._activeId) {
            this._activeId = val;
        }
    }

    @Output()
    public openNext: EventEmitter<TSongId>;

    constructor(public cvService: ContentViewerService) {
        this.openNext = new EventEmitter<TSongId>();
    }

    onCloseDetailTab(mapDetail: TMapDetail): void {
        this.cvService.delSongDetailView(mapDetail);
    }
}
