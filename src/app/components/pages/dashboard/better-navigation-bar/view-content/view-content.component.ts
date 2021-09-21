import {
    AfterContentInit,
    Component,
    ContentChild,
    EmbeddedViewRef,
    Input,
    OnDestroy,
    TemplateRef
} from '@angular/core';
import { UnsubscribeComponent } from '../../../../../../models/angular/unsubscribe.model';
import { ViewTemplateDirective } from '../view-template/view-template.directive';

@Component({
    selector: 'app-view-content',
    templateUrl: './view-content.component.html',
    styleUrls: ['./view-content.component.scss']
})
export class ViewContentComponent
    extends UnsubscribeComponent
    implements AfterContentInit, OnDestroy
{
    @ContentChild(ViewTemplateDirective) template?: ViewTemplateDirective;

    contentTemplate?: TemplateRef<any>;

    view!: EmbeddedViewRef<any> | null;

    public loaded: boolean;

    private _selected: boolean;
    @Input()
    set selected(val: boolean) {
        this._selected = val;
        if (val) this.loaded = true;
    }
    get selected(): boolean {
        return this._selected;
    }

    @Input()
    id?: string;

    constructor() {
        super();
        this.loaded = false;
        this._selected = false;
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
