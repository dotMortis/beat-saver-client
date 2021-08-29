import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SharedAppModule } from '../../../../shared/shared-app-module';
import { ChangelogComponent } from './changelog/changelog.component';
import { CoffeeComponent } from './coffee/coffee.component';
import { NavigationBarComponent } from './navigation-bar.component';

@NgModule({
    declarations: [NavigationBarComponent, CoffeeComponent, ChangelogComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        JoyrideModule.forChild(),
        MarkdownModule.forChild(),
        ButtonModule,
        ToggleButtonModule,
        BadgeModule,
        DynamicDialogModule,
        DropdownModule,
        TieredMenuModule
    ],
    entryComponents: [CoffeeComponent, ChangelogComponent],
    exports: [NavigationBarComponent]
})
export class NavigationBarModule {}
