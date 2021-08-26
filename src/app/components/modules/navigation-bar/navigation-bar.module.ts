import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { MarkdownModule } from 'ngx-markdown';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { CoffeeComponent } from './coffee/coffee.component';
import { NavigationBarComponent } from './navigation-bar.component';

@NgModule({
    declarations: [NavigationBarComponent, CoffeeComponent],
    imports: [
        CommonModule,
        SharedAppModule,
        JoyrideModule.forChild(),
        MarkdownModule.forChild(),
        ButtonModule,
        BadgeModule,
        DynamicDialogModule
    ],
    entryComponents: [CoffeeComponent],
    exports: [NavigationBarComponent]
})
export class NavigationBarModule {}
