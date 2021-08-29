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
                path: ':songId',
                loadChildren: () =>
                    import('./../songs-detail/songs-detail.module').then(m => m.SongsDetailModule)
            }
        ]
    }
];

export const DashboardRounting = RouterModule.forChild(routes);
