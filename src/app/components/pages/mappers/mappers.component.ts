import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { finalize, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TMapperListResult } from '../../../../models/api/api.models';
import { ApiService } from '../../../services/null.provided/api.service';

@Component({
    selector: 'app-mappers',
    templateUrl: './mappers.component.html',
    styleUrls: ['./mappers.component.scss']
})
export class MappersComponent extends UnsubscribeComponent implements OnInit {
    totalRecords: number;
    mappers: TMapperListResult[];
    columns: {
        field: string;
        header: string;
        class?: string;
        headerClass?: string;
        'min-width'?: string;
        width?: string;
        default?: string | number;
    }[];
    loading: boolean;

    constructor(private _apiService: ApiService, private _cdr: ChangeDetectorRef) {
        super();
        this.totalRecords = Infinity;
        this.columns = [
            {
                field: 'id',
                header: '#',
                width: '50px',
                class: 'text-center',
                headerClass: 'text-center'
            },
            { field: 'name', header: 'Mapper', width: '200px', 'min-width': '100px' },
            { field: 'stats.avgBpm', header: 'Score', 'min-width': '100px', width: '100px' }
        ];
        this.mappers = new Array<TMapperListResult>();
        this.loading = false;
    }

    ngOnInit(): void {
        this._apiService.test();
    }

    loadScoresLazy(event: LazyLoadEvent): void {
        return;
        console.log(event);

        this.loading = true;
        this.addSub(
            this._apiService.getMapppersList(0).pipe(
                tap((mappers: TMapperListResult[]) => {
                    this.mappers = mappers;
                    this._cdr.detectChanges();
                }),
                finalize(() => (this.loading = false))
            )
        );
    }

    getCellValue(field: string, obj: any, defaultVal: string | number): any {
        const fields = field.split('.');
        const tempVal = obj[fields[0]];
        if (fields.length === 1) {
            if (tempVal == null || (tempVal instanceof Array && tempVal.length === 0))
                return defaultVal || tempVal;
            return tempVal;
        } else {
            const newFields = fields.splice(0, 1).join('.');
            if (tempVal instanceof Array) {
                return tempVal.map((tempVal: any[]) =>
                    this.getCellValue(newFields, tempVal, defaultVal)
                );
            } else {
                return this.getCellValue(newFields, tempVal, defaultVal);
            }
        }
    }

    onRefresh(): void {
        this.mappers = [];
        this.loadScoresLazy({ first: 0, rows: 20 });
        this._cdr.detectChanges();
    }
}
