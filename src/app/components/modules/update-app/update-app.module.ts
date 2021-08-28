import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { UpdateAppComponent } from './update-app.component';

@NgModule({
    declarations: [UpdateAppComponent],
    imports: [CommonModule, SharedAppModule],
    exports: [UpdateAppComponent],
    providers: []
})
export class UpdateAppModule {}
