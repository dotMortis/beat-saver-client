import { Component } from '@angular/core';
import { resolve } from 'path';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

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

    constructor(private _ref: DynamicDialogRef) {
        this._coffeeImgUrl = resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            '..',
            'assets',
            'coffee.png'
        );
        this._patreonImgUrl = resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            '..',
            'assets',
            'become_a_patreon.png'
        );
    }

    onChangelog() {
        this._ref.close('CHANGELOG');
    }
}
