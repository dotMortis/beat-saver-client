import { CommonModule } from '@angular/common';
import { Directive, Input, NgModule, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appViewTemplate]'
})
export class ViewTemplateDirective {
    @Input() type!: string;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('viewTemaplte') name!: string;

    constructor(public template: TemplateRef<any>) {}

    getType(): string {
        return this.name;
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [ViewTemplateDirective],
    declarations: [ViewTemplateDirective]
})
export class ViewTemplateModule {}
