import { Component, OnInit } from '@angular/core';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { LocalMapsService } from '../../../services/null.provided/local-maps.service';

@Component({
    selector: 'app-local-maps',
    templateUrl: './local-maps.component.html',
    styleUrls: ['./local-maps.component.scss']
})
export class LocalMapsComponent extends UnsubscribeComponent implements OnInit {
    constructor(public localMapsService: LocalMapsService) {
        super();
    }

    ngOnInit(): void {
        this.onSearch(false);
    }

    onSearch(more: boolean): void {
        this.addSub(this.localMapsService.getList(more));
    }
}
