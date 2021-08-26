import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-coffee',
    templateUrl: './coffee.component.html',
    styleUrls: ['./coffee.component.scss']
})
export class CoffeeComponent {
    constructor(private _ref: DynamicDialogRef) {}

    onChangelog() {
        console.log('CLOSE');

        this._ref.close('CHANGELOG');
    }
}
