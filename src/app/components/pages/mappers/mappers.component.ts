import { ChangeDetectorRef, Component } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { finalize, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/angular/unsubscribe.model';
import { TMapperListResult } from '../../../../models/api/api.models';
import { TSendEmitDownload } from '../../../../models/electron/send.channels';
import { ApiService } from '../../../services/null.provided/api.service';
import { ContentViewerService } from '../../../services/null.provided/content-viewer.service';
import { ElectronService } from '../../../services/root.provided/electron.service';
import { TMapperColumn } from './mapper-column.model';

@Component({
    selector: 'app-mappers',
    templateUrl: './mappers.component.html',
    styleUrls: ['./mappers.component.scss']
})
export class MappersComponent extends UnsubscribeComponent {
    totalRecords: number;
    mappers: TMapperListResult[];
    columns: TMapperColumn[];
    private _selectedColumns: TMapperColumn[];
    get selectedColumns(): TMapperColumn[] {
        return this._selectedColumns;
    }
    set selectedColumns(val: TMapperColumn[]) {
        this._selectedColumns = val.sort((a, b) => a.rank - b.rank);
    }
    loading: boolean;
    currentPage: number;

    constructor(
        private _apiService: ApiService,
        private _cdr: ChangeDetectorRef,
        private _eleService: ElectronService,
        private _cvService: ContentViewerService
    ) {
        super();
        this.totalRecords = Infinity;
        this.columns = [
            {
                rank: 1,
                type: 'index',
                field: '',
                header: '#',
                'min-width': '45px',
                'max-width': '45px',
                class: 'text-center',
                headerClass: 'text-center',
                resizable: false
            },
            {
                rank: 2,
                headerIcon: 'pi-image',
                iconType: 'pi',
                type: 'avatar',
                field: 'avatar',
                header: 'Avatar',
                'min-width': '45px',
                'max-width': '45px',
                resizable: false,
                class: 'text-center'
            },
            {
                rank: 3,
                type: 'string',
                field: 'name',
                header: 'Mapper',
                resizable: true,
                class: 'text-center',
                hrefClick: (val: TMapperListResult) => {
                    this.onOpenDetail(val);
                }
            },
            {
                rank: 4,
                headerIcon: ['fas', 'tachometer-alt'],
                iconType: 'fa',
                type: 'number',
                field: 'stats.avgBpm',
                header: 'Avg BPM',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 5,
                headerIcon: ['fas', 'clock'],
                iconType: 'fa',
                type: 'date',
                field: '',
                header: 'Avg Duration',
                transformer: (val: TMapperListResult) => {
                    return val.stats.avgDuration * 1000;
                },
                pipeFormat: 'mm:ss',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 6,
                type: 'number',
                headerIcon: ['fas', 'thumbs-up'],
                iconType: 'fa',
                field: 'stats.totalUpvotes',
                header: 'Total Upvotes',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 7,
                headerIcon: ['fas', 'thumbs-down'],
                iconType: 'fa',
                type: 'number',
                field: 'stats.totalDownvotes',
                header: 'Total Downvotes',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 8,
                headerIcon: ['fas', 'percent'],
                iconType: 'fa',
                type: 'number',
                field: '',
                header: 'Ratio',
                transformer: (val: TMapperListResult) => {
                    return (
                        (100 / (val.stats.totalUpvotes + val.stats.totalDownvotes)) *
                        val.stats.totalUpvotes
                    );
                },
                resizable: true,
                postfix: '%',
                class: 'text-center'
            },
            {
                rank: 9,
                headerIcon: ['fas', 'map-marked'],
                iconType: 'fa',
                type: 'number',
                field: 'stats.totalMaps',
                header: 'Total Maps',
                resizable: true,
                class: 'text-center'
            },
            {
                headerIcon: ['fas', 'star'],
                iconType: 'fa',
                rank: 10,
                type: 'number',
                field: 'stats.rankedMaps',
                header: 'Ranked Maps',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 11,
                type: 'date',
                field: 'stats.firstUpload',
                header: 'First',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 12,
                type: 'date',
                field: 'stats.lastUpload',
                header: 'Last',
                resizable: true,
                class: 'text-center'
            },
            {
                rank: 13,
                type: 'btn',
                field: '',
                header: 'Playlist',
                resizable: false,
                'min-width': '45px',
                'max-width': '45px',
                class: 'text-center',
                btnIcon: 'pi pi-list',
                btnHrefClick: (val: TMapperListResult) => {
                    this._eleService.send<TSendEmitDownload>(
                        'EMIT_DOWNLOAD',
                        `https://beatsaver.com/api/users/id/${val.id}/playlist`
                    );
                }
            }
        ];
        this._selectedColumns = [...this.columns];
        this.mappers = new Array<TMapperListResult>();
        this.loading = false;
        this.currentPage = 0;
    }

    loadScoresLazy(event: LazyLoadEvent): void {
        this.currentPage = event.first ? event.first / 20 : 0;
        this.loading = true;
        this._cdr.detectChanges();
        this.addSub(
            this._apiService.getMapppersList(this.currentPage).pipe(
                tap((mappers: TMapperListResult[]) => {
                    this.mappers = [...mappers];
                }),
                finalize(() => (this.loading = false))
            )
        );
    }

    getCellValue(field: string, obj: any, defaultVal: string | number): any {
        const fields = field.split('.');
        const tempVal = obj[fields[0]];
        if (obj instanceof Array) {
            return obj.map((tempVal: any) => this.getCellValue(field, tempVal, defaultVal));
        }
        if (fields.length === 1) {
            if (tempVal == null || (tempVal instanceof Array && tempVal.length === 0))
                return defaultVal || tempVal;
            return tempVal;
        } else {
            fields.shift();
            const newFields = fields.join('.');
            if (tempVal instanceof Array) {
                return tempVal.map((tempVal: any) =>
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

    onOpenDetail(mapper: TMapperListResult) {
        this._cvService.addMapperDetailView({ id: mapper.id });
    }
}
