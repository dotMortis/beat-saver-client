import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SafePipe } from '../pipes/safe.pipe';
@NgModule({
    declarations: [SafePipe],
    exports: [RippleModule, TooltipModule, FontAwesomeModule, SafePipe]
})
export class SharedAppModule {}
