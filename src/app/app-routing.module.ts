import { RouterModule, Routes } from '@angular/router';
import { SongsComponent } from './components/pages/songs/songs.component';

const routes: Routes = [
    {
        path: '',
        component: SongsComponent
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const AppRoutingModule = RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' });
