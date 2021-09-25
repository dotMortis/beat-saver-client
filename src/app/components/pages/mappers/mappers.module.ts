import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TableModule } from 'primeng/table';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { MappersComponent } from './mappers.component';

@NgModule({
    declarations: [MappersComponent],
    imports: [CommonModule, SharedAppModule, TableModule, ButtonModule, ScrollTopModule],
    exports: [MappersComponent],
    providers: []
})
export class MappersModule {}
