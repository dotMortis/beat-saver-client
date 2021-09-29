import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TableModule } from 'primeng/table';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { MappersComponent } from './mappers.component';
@NgModule({
    declarations: [MappersComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        TableModule,
        ButtonModule,
        ScrollTopModule,
        ScrollPanelModule,
        AvatarModule,
        MultiSelectModule,
        FormsModule,
        RouterModule
    ],
    exports: [MappersComponent],
    providers: []
})
export class MappersModule {}
