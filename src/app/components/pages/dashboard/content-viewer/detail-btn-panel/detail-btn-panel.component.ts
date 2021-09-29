import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TOpenId } from '../../../../../../models/openEvent.model';
import { ContentViewerService } from '../../../../../services/null.provided/content-viewer.service';

@Component({
    selector: 'app-detail-btn-panel',
    templateUrl: './detail-btn-panel.component.html',
    styleUrls: ['./detail-btn-panel.component.scss']
})
export class DetailBtnPanelComponent {
    private _activeId?: TOpenId;
    @Input()
    get activeId(): TOpenId | undefined {
        return this._activeId;
    }
    set activeId(val: TOpenId | undefined) {
        if (val !== this._activeId) {
            this._activeId = val;
        }
    }

    @Output()
    public openNext: EventEmitter<TOpenId>;

    constructor(public cvService: ContentViewerService) {
        this.openNext = new EventEmitter<TOpenId>();
    }

    onCloseDetailTab(id: TOpenId): void {
        switch (id.type) {
            case 'map': {
                this.cvService.delSongDetailView(id.id);
                break;
            }
            case 'mapper': {
                break;
            }
            default: {
                break;
            }
        }
    }
}
