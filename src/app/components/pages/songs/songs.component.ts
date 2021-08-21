import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendError } from '../../../../models/electron/send.channels';
import { ApiService } from '../../../services/api.service';
import { DlService } from '../../../services/dl.service';
import { ElectronService } from '../../../services/electron.service';

@Component({
    selector: 'app-songs',
    templateUrl: './songs.component.html',
    styleUrls: ['./songs.component.scss']
})
export class SongsComponent {
    constructor(
        public apiService: ApiService,
        public dlService: DlService,
        private _eleService: ElectronService
    ) {}

    onSearch(more: boolean = false): void {
        this.apiService
            .getList(more)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                    return EMPTY;
                })
            )
            .subscribe();
    }
}
