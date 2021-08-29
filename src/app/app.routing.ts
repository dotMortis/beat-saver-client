import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () =>
            import('./components/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const AppRoutingModule = RouterModule.forRoot(routes);
