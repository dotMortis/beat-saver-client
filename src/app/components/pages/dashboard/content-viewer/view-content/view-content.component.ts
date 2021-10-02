import {
    AfterContentInit,
    Component,
    ContentChild,
    EmbeddedViewRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef
} from '@angular/core';
import { interval, of, Subject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../../../models/angular/unsubscribe.model';
import { TOpenId } from '../../../../../../models/openEvent.model';
import { NotifyService } from '../../../../../services/root.provided/notify.service';
import { ViewTemplateDirective } from '../view-template/view-template.directive';

@Component({
    selector: 'app-view-content',
    templateUrl: './view-content.component.html',
    styleUrls: ['./view-content.component.scss']
})
export class ViewContentComponent
    extends UnsubscribeComponent
    implements AfterContentInit, OnDestroy, OnInit
{
    @ContentChild(ViewTemplateDirective) template?: ViewTemplateDirective;

    contentTemplate?: TemplateRef<any>;

    view!: EmbeddedViewRef<any> | null;

    private _selectedChange: Subject<boolean>;

    private _loaded: boolean;
    get loaded(): boolean {
        return this._loaded;
    }
    set loaded(val: boolean) {
        if (val !== this._loaded) this._loaded = val;
    }

    private _selected: boolean;
    @Input()
    set selected(val: boolean) {
        if (this._selected !== val) {
            this._selected = val;
            this._selectedChange.next(val);
            if (val) this.loaded = true;
        }
    }
    get selected(): boolean {
        return this._selected;
    }

    private _livetime: number;
    @Input()
    get livetime(): number {
        return this._livetime;
    }
    set livetime(val: number) {
        if (val !== this._livetime) {
            this._livetime = val;
        }
    }

    @Input()
    id?: TOpenId;

    @Input()
    scrollPanel: boolean;

    constructor(private _notify: NotifyService) {
        super(_notify);
        this._loaded = false;
        this._selected = false;
        this._selectedChange = new Subject<boolean>();
        this._livetime = -1;
        this.scrollPanel = true;
    }

    ngOnInit(): void {
        if (this.livetime >= 0) {
            this.addSub(
                this._selectedChange.pipe(
                    switchMap((val: boolean) => {
                        if (val) {
                            return of(null);
                        } else if (this.loaded) {
                            return interval(this.livetime).pipe(take(1));
                        }
                        return of(null);
                    }),
                    tap((res: number | null) => {
                        if (res != null) {
                            this.loaded = false;
                        }
                    })
                )
            );
        }
    }

    ngAfterContentInit(): void {
        if (this.template) {
            this.contentTemplate = this.template.template;
        }
    }

    ngOnDestroy() {
        this.view = null;
        super.ngOnDestroy();
    }
}
