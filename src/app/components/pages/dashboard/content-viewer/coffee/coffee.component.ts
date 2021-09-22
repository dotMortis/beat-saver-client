import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../../../environments/environment';
@Component({
    selector: 'app-coffee',
    templateUrl: './coffee.component.html',
    styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent {
    private _coffeeImgUrl: string;
    get coffeeImgUrl(): string {
        return this._coffeeImgUrl;
    }

    private _patreonImgUrl: string;
    get patreonImgUrl(): string {
        return this._patreonImgUrl;
    }

    get version(): string {
        return environment.version;
    }

    constructor(private _ref: DynamicDialogRef) {
        this._coffeeImgUrl = 'assets/coffee.png';
        this._patreonImgUrl = 'assets/become_a_patreon.png';
    }
    onChangelog() {
        this._ref.close('CHANGELOG');
    }
}
