import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const DashboardRounting = RouterModule.forChild(routes);
