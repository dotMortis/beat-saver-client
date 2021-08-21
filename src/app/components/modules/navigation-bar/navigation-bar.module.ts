import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { SharedAppModule } from '../../../shared/shared-app-module';
import { NavigationBarComponent } from './navigation-bar.component';

@NgModule({
    declarations: [NavigationBarComponent],
    imports: [CommonModule, SharedAppModule, ButtonModule, BadgeModule],
    exports: [NavigationBarComponent]
})
export class NavigationBarModule {}
