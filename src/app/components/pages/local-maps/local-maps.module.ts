import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { LocalMapsComponent } from './local-maps.component';
import { LocalMapsRounting } from './local-maps.routing';

@NgModule({
    declarations: [LocalMapsComponent],
    imports: [LocalMapsRounting, CommonModule, SharedAppModule],
    exports: [LocalMapsComponent],
    providers: []
})
export class LocalMapsModule {}
