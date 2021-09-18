import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./../songs/songs.module').then(m => m.SongsModule)
            },
            {
                path: 'locals',
                pathMatch: 'full',
                loadChildren: () =>
                    import('./../local-maps/local-maps.module').then(m => m.LocalMapsModule)
            },
            {
                path: 'song',
                loadChildren: () =>
                    import('./../songs-detail/songs-detail.module').then(m => m.SongsDetailModule)
            }
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const DashboardRounting = RouterModule.forChild(routes);
