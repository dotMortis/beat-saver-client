import { Component } from '@angular/core';
import { resolve } from 'path';

@Component({
    selector: 'app-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
    private _mdUrl: string;
    get mdUrl(): string {
        return this._mdUrl;
    }
    constructor() {
        this._mdUrl = resolve(__dirname, '..', '..', '..', '..', '..', 'assets', 'CHANGELOG.md');
    }
}
