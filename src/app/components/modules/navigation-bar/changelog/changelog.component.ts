import { Component } from '@angular/core';

@Component({
    selector: 'app-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
    constructor() {
        console.log('SHOW CHANGELOG');
    }
}
