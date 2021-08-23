import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { SettingsComponent } from './settings.component';

@NgModule({
    declarations: [SettingsComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        FormsModule,
        SidebarModule,
        ScrollPanelModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        InputSwitchModule
    ],
    exports: [SettingsComponent]
})
export class SettingsModule {}
