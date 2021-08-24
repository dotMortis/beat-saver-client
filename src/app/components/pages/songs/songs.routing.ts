import { RouterModule, Routes } from '@angular/router';
import { SongsComponent } from './songs.component';

const routes: Routes = [
    {
        path: '',
        component: SongsComponent
    }
];

export const SongsRounting = RouterModule.forChild(routes);
