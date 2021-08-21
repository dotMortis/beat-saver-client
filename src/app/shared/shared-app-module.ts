import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
@NgModule({
    exports: [RippleModule, TooltipModule, FontAwesomeModule]
})
export class SharedAppModule {}
