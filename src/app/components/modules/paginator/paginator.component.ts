import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { NotifyService } from '../../../services/root.provided/notify.service';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent extends UnsubscribeComponent {
    private _totalRecords: number;
    @Input()
    set totalRecords(val: number) {
        if (typeof val === 'number') {
            this._totalRecords = val;
        } else {
            this._totalRecords = Infinity;
        }
    }
    get totalRecords(): number {
        return this._totalRecords;
    }

    private _rows: number;
    @Input()
    set rows(val: number) {
        if (val !== this._rows) {
            this._rows = val;
        }
    }
    get rows(): number {
        return this._rows;
    }

    @Output()
    paginate: EventEmitter<number>;

    private _first: number;
    @Input()
    set first(val: number) {
        if (val !== this._first) {
            this._first = val;
            this.firstChange.next(this._first);
        }
    }
    get first(): number {
        return this._first;
    }
    @Output()
    firstChange: EventEmitter<number>;

    goToPage?: number;

    infinity = Infinity;

    constructor(private _notify: NotifyService) {
        super(_notify);
        this._first = 0;
        this._rows = 20;
        this._totalRecords = Infinity;
        this.paginate = new EventEmitter<number>();
        this.firstChange = new EventEmitter<number>();
    }

    onSearch(event: { page: number }): void {
        this.first = event.page * this.rows;
        this.paginate.next(event.page);
    }

    onGoToPage(): void {
        if (this.goToPage != null) {
            if (
                this.totalRecords < Infinity &&
                this.goToPage > Math.ceil(this.totalRecords / this.rows)
            ) {
                const maxPage = Math.ceil(this.totalRecords / this.rows);
                this.onSearch({ page: maxPage - 1 });
            } else if (this.goToPage < 1) {
                this.onSearch({ page: 0 });
            } else {
                this.onSearch({ page: this.goToPage - 1 });
            }
        } else {
            this.onSearch({ page: 0 });
        }
    }
}
