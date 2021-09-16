import { RouterModule, Routes } from '@angular/router';
import { LocalMapsComponent } from './local-maps.component';

const routes: Routes = [
    {
        path: '',
        component: LocalMapsComponent
    }
];

export const LocalMapsRounting = RouterModule.forChild(routes);
