import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../../models/angular/unsubscribe.model';
import { TMapDetail } from '../../../../../models/api/api.models';
import { TInvokeMapsCount } from '../../../../../models/electron/invoke.channels';
import { TSendError, TSendMapsCount } from '../../../../../models/electron/send.channels';
import { TSongId } from '../../../../../models/maps/map-ids.model';
import { MapsHelpers } from '../../../../../models/maps/maps.helpers';
import { TOpenId } from '../../../../../models/openEvent.model';
import { ApiService } from '../../../../services/null.provided/api.service';
import { ContentViewerService } from '../../../../services/null.provided/content-viewer.service';
import { DlService } from '../../../../services/null.provided/dl.service';
import { LocalMapsService } from '../../../../services/null.provided/local-maps.service';
import { PlayerStatsService } from '../../../../services/null.provided/player-stats.service';
import { ElectronService } from '../../../../services/root.provided/electron.service';
import { NotifyService } from '../../../../services/root.provided/notify.service';
import { SettingsService } from '../../../../services/root.provided/settings.service';
import { ChangelogComponent } from './changelog/changelog.component';
import { CoffeeComponent } from './coffee/coffee.component';
import { ViewContentComponent } from './view-content/view-content.component';

@Component({
    selector: 'app-content-viewer',
    templateUrl: './content-viewer.component.html',
    styleUrls: ['./content-viewer.component.scss'],
    providers: [DialogService]
})
export class ContentViewerComponent extends UnsubscribeComponent implements AfterViewInit, OnInit {
    @ViewChildren(ViewContentComponent) viewContents!: QueryList<ViewContentComponent>;
    @ViewChild('navToggleButton') navToggleButton!: ElementRef;
    @ViewChild('nav') nav!: ElementRef;

    private _innerWidth: number;
    set innerWidth(val: number) {
        if (this.isNavOpen === false && this._innerWidth >= 992) {
            this.isNavOpen = true;
        } else if (this.isNavOpen === true && this._innerWidth < 992) {
            this.isNavOpen = false;
        }
    }
    get innerWidth(): number {
        return this._innerWidth;
    }
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.innerWidth = event.target.innerWidth;
    }

    contents: ViewContentComponent[];

    activeIndex?: number;

    private _ref?: DynamicDialogRef;
    private _communityMenuItems: MenuItem[];
    get communityMenuItems(): MenuItem[] {
        return this._communityMenuItems;
    }
    private _selectedDetail?: TOpenId;
    get selectedDetail(): TOpenId | undefined {
        return this._selectedDetail;
    }
    set selectedDetail(val: TOpenId | undefined) {
        if (val?.id !== this._selectedDetail?.id || val?.type !== this._selectedDetail?.type) {
            this._selectedDetail = val;
            if (val) this.onOpen(val);
        }
    }

    activeId?: TOpenId;
    installedCount: number;
    songIdSearch: string;
    isNavOpen: boolean;

    constructor(
        public optService: SettingsService,
        public dlService: DlService,
        public electronService: ElectronService,
        public cvService: ContentViewerService,
        private _cd: ChangeDetectorRef,
        private _installedSongsService: LocalMapsService,
        private _playerStatsService: PlayerStatsService,
        private _dialogService: DialogService,
        private _notify: NotifyService,
        private _apiService: ApiService,
        private _renderer: Renderer2
    ) {
        super(_notify);
        this.contents = [];
        this._communityMenuItems = [
            {
                label: 'Discords',
                items: [
                    {
                        label: 'Cube Community',
                        url: 'https://discord.gg/dwe8mbC',
                        target: '_blank'
                    },
                    {
                        label: 'BeatSaver',
                        url: 'https://discord.gg/rjVDapkMmj',
                        target: '_blank'
                    },
                    {
                        label: 'Score Saber',
                        url: 'https://discord.gg/WpuDMwU',
                        target: '_blank'
                    },
                    {
                        label: 'BSMG',
                        url: 'https://discord.gg/beatsabermods',
                        target: '_blank'
                    },
                    {
                        label: 'Challange Community',
                        url: 'https://discord.gg/bscc',
                        target: '_blank'
                    }
                ]
            },
            {
                label: 'Websites',
                items: [
                    {
                        label: 'BeatSaver',
                        url: 'https://beatsaver.com/',
                        target: '_blank'
                    },
                    {
                        label: 'BeastSaber',
                        url: 'https://bsaber.com/',
                        target: '_blank'
                    },
                    {
                        label: 'ScoreSaber',
                        url: 'https://scoresaber.com/',
                        target: '_blank'
                    },
                    {
                        label: 'ModelSaber',
                        url: 'https://modelsaber.com/',
                        target: '_blank'
                    },
                    {
                        label: 'BeatMods',
                        url: 'https://beatmods.com/',
                        target: '_blank'
                    },
                    {
                        label: 'BSMG Wiki',
                        url: 'https://bsmg.wiki/',
                        target: '_blank'
                    }
                ]
            }
        ];
        this.installedCount = 0;
        this.songIdSearch = '';
        this.isNavOpen = false;
        this.innerWidth = this._innerWidth = window.innerWidth;
        this._renderer.listen('window', 'click', (e: Event) => {
            if (
                this.innerWidth < 992 &&
                this.isNavOpen === true &&
                e.target !== this.navToggleButton.nativeElement
            )
                this.isNavOpen = false;
        });
    }

    ngOnInit(): void {
        this.addSub(
            this.electronService
                .on<TSendMapsCount>('MAPS_COUNT')
                .pipe(tap((count: number) => (this.installedCount = count)))
        );
        this.electronService
            .invoke<TInvokeMapsCount>('MAPS_COUNT', undefined)
            .then((count: number | false | Error) => {
                if (count instanceof Error) {
                    this._notify.error({ title: 'Get Local Maps Count', error: count });
                } else this.installedCount = count != false ? count : 0;
            });
    }

    ngAfterViewInit(): void {
        this._initContents();
        this.addSub(this.viewContents.changes.pipe(tap(() => this._initContents())));
        this.addSub(this.cvService.onOpen.pipe(tap((next: TOpenId) => this.onOpen(next))));
    }

    async onReload(): Promise<void> {
        await Promise.all([
            this._playerStatsService
                .loadPlayersStats()
                .catch(e => this.electronService.send<TSendError>('ERROR', e)),
            this._installedSongsService
                .loadInstalledSongs()
                .catch((e: any) => this.electronService.send<TSendError>('ERROR', e))
        ]);
    }

    showCoffee() {
        this._ref = this._dialogService.open(CoffeeComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            header: 'About BeatSaver Client',
            baseZIndex: 10000
        });
        this.addSub(
            this._ref.onClose.pipe(
                take(1),
                tap((msg: 'CHANGELOG' | undefined) => {
                    if (msg === 'CHANGELOG') {
                        this.showChangelog();
                    }
                })
            )
        );
    }

    showChangelog(): void {
        this._ref?.close();
        this._ref = this._dialogService.open(ChangelogComponent, {
            width: '70%',
            style: { 'max-width': '720px' },
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            baseZIndex: 10000
        });
    }

    onOpen(content: ViewContentComponent | TOpenId): void {
        this.activeId = undefined;
        const selectedContent = this._findSelectedContent();
        if (selectedContent) selectedContent.selected = false;
        if (content instanceof ViewContentComponent) {
            content.selected = true;
        } else {
            const index = this._findContentIndex(content);

            if (index > -1) {
                this.activeId = content;
                this.contents[index].selected = true;
            }
        }
    }

    onSearchById(id: TSongId): void {
        this.addSub(
            this._apiService.getById(id).pipe(
                tap((mapDetail: TMapDetail) => {
                    const latestVersion = MapsHelpers.getLatestVersion(mapDetail);
                    this.cvService.addSongDetailView(mapDetail, latestVersion);
                }),
                catchError(err => {
                    this._notify.error({
                        title: 'Song ID not found',
                        error: new Error('Song ID not found')
                    });
                    return of(null);
                })
            )
        );
    }

    private _initContents(): void {
        this.contents = this.viewContents.toArray();
        if (this.cvService.openNext) {
            this.onOpen(this.cvService.openNext);
            this.cvService.openNext = undefined;
        } else {
            const selectedContent = this._findSelectedContent();
            if (!selectedContent && this.contents.length) {
                this.contents[0].selected = true;
                this.activeId = this.contents[0].id;
            }
        }
        this._cd.detectChanges();
    }

    private _findSelectedContent(): ViewContentComponent | undefined {
        for (const content of this.contents) {
            if (content.selected) return content;
        }
        return;
    }

    private _findContentIndex(content: ViewContentComponent | TOpenId): number {
        for (let i = 0; i < this.contents.length; i++) {
            if (!(content instanceof ViewContentComponent)) {
                if (
                    this.contents[i].id?.id === content.id &&
                    this.contents[i].id?.type === content.type
                ) {
                    return i;
                }
            } else if (this.contents[i] == content) {
                return i;
            }
        }
        return -1;
    }
}
