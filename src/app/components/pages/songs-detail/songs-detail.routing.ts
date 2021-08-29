import { RouterModule, Routes } from '@angular/router';
import { SongsDetailComponent } from './songs-detail.component';

const routes: Routes = [
    {
        path: '',
        component: SongsDetailComponent
    }
];

export const SongsDetailRounting = RouterModule.forChild(routes);
