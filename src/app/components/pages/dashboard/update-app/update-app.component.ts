import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../../models/angular/unsubscribe.model';
import { UpdateService } from '../../../../services/null.provided/update.service';
import { NotifyService } from '../../../../services/root.provided/notify.service';
import { InstallPanelComponent } from './install-panel/install-panel.component';

@Component({
    selector: 'app-update-app',
    templateUrl: './update-app.component.html',
    styleUrls: ['./update-app.component.scss'],
    providers: [DialogService, UpdateService]
})
export class UpdateAppComponent extends UnsubscribeComponent implements OnInit {
    private _ref?: DynamicDialogRef;
    private _visible: boolean;
    private _nextVisible: boolean;
    get visible(): boolean {
        return this._visible;
    }
    set visible(val: boolean) {
        if (val !== this._visible) {
            if (val) this._visible = this._nextVisible = val;
            else if (this._nextVisible !== val) {
                this._nextVisible = val;
                setTimeout(() => {
                    this._visible = val;
                }, 3000);
            }
        }
    }

    private _statusLabel?: string;
    get statusLabel(): string | undefined {
        return this._statusLabel;
    }

    constructor(
        public updateService: UpdateService,
        private _dialogService: DialogService,
        private _notify: NotifyService
    ) {
        super(_notify);
        this._nextVisible = this._visible = false;
    }

    ngOnInit(): void {
        this.addSub(
            this.updateService.onChange.pipe(
                tap(status => {
                    if (
                        status !== 'CHECK_UPDATES' &&
                        status !== 'UPDATE_DL_PROGRESS' &&
                        status !== 'UPDATE_FOUND'
                    ) {
                        this.visible = false;
                    } else {
                        this.visible = true;
                    }
                    this._setStatusLabel(status);
                    if (status === 'UPDATE_DOWNLOADED') this.showInstallPanel();
                })
            )
        );
    }

    showInstallPanel() {
        this._ref = this._dialogService.open(InstallPanelComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            header: 'Install update',
            baseZIndex: 10000,
            closable: false,
            data: { info: this.updateService.updateInfo, label: this.statusLabel }
        });
    }

    private _setStatusLabel(
        status:
            | 'CHECK_UPDATES'
            | 'NO_UPDATE'
            | 'UPDATE_FOUND'
            | 'ERROR'
            | 'UPDATE_DL_PROGRESS'
            | 'UPDATE_DOWNLOADED'
            | undefined
    ): void {
        switch (status) {
            case 'CHECK_UPDATES': {
                this._statusLabel = 'Looking for fancy updates :upside_down_face:';
                break;
            }
            case 'NO_UPDATE': {
                this._statusLabel = 'There are no fancy updates :pleading_face:';
                break;
            }
            case 'UPDATE_FOUND': {
                this._statusLabel = 'Fancy updates found :flushed:';
                break;
            }
            case 'ERROR': {
                this._statusLabel = 'Oh no, an error has occurred :tired_face:';
                break;
            }
            case 'UPDATE_DL_PROGRESS': {
                this._statusLabel = 'Downloading :coffee:';
                break;
            }
            case 'UPDATE_DOWNLOADED': {
                this._statusLabel = 'Update downloaded :partying_face:';
                break;
            }
            default: {
                this._statusLabel = status;
                break;
            }
        }
    }
}
