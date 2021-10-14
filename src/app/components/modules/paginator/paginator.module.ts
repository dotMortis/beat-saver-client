import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule as PrimePaginatorModule } from 'primeng/paginator';
import { PaginatorComponent } from './paginator.component';

@NgModule({
    declarations: [PaginatorComponent],
    imports: [CommonModule, ButtonModule, PrimePaginatorModule, FormsModule, InputTextModule],
    exports: [PaginatorComponent],
    providers: []
})
export class PaginatorModule {}
