import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Calendar } from 'primeng/calendar';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EListSortOrder, IListOptions } from '../../../../models/api.models';
import { ipcRendererSend } from '../../../../models/electron/electron.register';
import { TSendError } from '../../../../models/electron/send.channels';
import { ApiService } from '../../../services/api.service';
import { ElectronService } from '../../../services/electron.service';

@Component({
    selector: 'app-song-filter',
    templateUrl: './song-filter.component.html',
    styleUrls: ['./song-filter.component.scss']
})
export class SongFilterComponent {
    @ViewChild('dateRangeCal') dateRangeCalendar?: Calendar;

    public activeFilterItems: Set<string>;
    public filterItems: {
        label: { label: string; value: string };
        items: { key: keyof IListOptions; code: string; label: string }[];
    }[];
    public orderBys: { name: string; code: EListSortOrder }[];

    private _orderBySelected: { name: string; code: EListSortOrder };
    get orderBySelected(): { name: string; code: EListSortOrder } {
        return this._orderBySelected;
    }
    set orderBySelected(val: { name: string; code: EListSortOrder }) {
        this._orderBySelected = val;
        this.apiService.orderBy = val.code;
    }

    private readonly _currentDate: Date;
    get currentDate(): Date {
        return this._currentDate;
    }
    get currentYear(): number {
        return this._currentDate.getUTCFullYear();
    }

    constructor(public apiService: ApiService, private _eleService: ElectronService) {
        this._currentDate = new Date();
        this.activeFilterItems = new Set<string>();
        this.filterItems = new Array<{
            label: { label: string; value: string };
            items: { key: keyof IListOptions; code: string; label: string }[];
        }>(
            {
                label: { label: 'GENERAL', value: 'GENERAL' },
                items: [
                    { key: 'automapper', code: 'ai', label: 'AI' },
                    { key: 'ranked', code: 'ranked', label: 'Ranked' },
                    { key: 'fullSpead', code: 'fs', label: 'Full Spread' }
                ]
            },
            {
                label: { label: 'REQUIREMENTS', value: 'REQUIREMENTS' },
                items: [
                    { key: 'chroma', code: 'chroma', label: 'Chroma' },
                    { key: 'noodle', code: 'noodle', label: 'Noodle' },
                    { key: 'me', code: 'me', label: 'MappinExtension' },
                    { key: 'cinema', code: 'cinema', label: 'Cinema' }
                ]
            }
        );
        this.orderBys = new Array<{ name: string; code: EListSortOrder }>(
            {
                name: 'Latest',
                code: EListSortOrder.LATEST
            },
            {
                name: 'Relevance',
                code: EListSortOrder.RELEVANCE
            },
            {
                name: 'Rating',
                code: EListSortOrder.RATING
            }
        );
        this._orderBySelected = this.orderBySelected = this.orderBys[1];
    }

    onSearch(): void {
        this.apiService
            .getList(false)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    ipcRendererSend<TSendError>(this._eleService, 'ERROR', error);
                    return EMPTY;
                })
            )
            .subscribe();
    }

    onDateRangeSelect() {
        if (
            this.apiService.dateRange &&
            this.apiService.dateRange[0] &&
            this.apiService.dateRange[1]
        ) {
            this.dateRangeCalendar?.toggle();
        }
    }

    onBoolFilterChange(event: {
        itemValue: { key: keyof IListOptions; code: string };
        value: { key: keyof IListOptions; code: string }[];
    }) {
        let added: true | undefined = undefined;
        for (const value of event.value || []) {
            if (value.key === event.itemValue.key) {
                added = true;
                break;
            }
        }
        const result = this.apiService.setboolFilter(event.itemValue.key, added);
        if (result === true) {
            this.activeFilterItems.add(event.itemValue.code);
        } else this.activeFilterItems.delete(event.itemValue.code);
    }
}
