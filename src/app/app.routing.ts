import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./components/pages/songs/songs.module').then(m => m.SongsModule)
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const AppRoutingModule = RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' });
