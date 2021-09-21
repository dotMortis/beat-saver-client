import { Component } from '@angular/core';

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
        this._mdUrl = 'assets/CHANGELOG.md';
    }
}
